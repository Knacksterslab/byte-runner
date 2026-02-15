'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, type LeaderboardEntry } from '@/lib/store/gameStore'
import { getRandomThreat, getThreatName, getQuickTip, threatTypes, type ThreatType, type ThreatCategory } from '@/lib/game/threatData'
import { getRandomGhostPlayer, type GhostPlayer } from '@/lib/game/ghostPlayers'
import { getProtectionKitName, getProtectionKitForThreat, getProtectionKitById, type ProtectionKit } from '@/lib/game/protectionKits'
import { getCurrentZone, isZoneTransition, getZoneTip, getThreatSpawnWeight } from '@/lib/game/zones'
import { trackGameStart, trackGameOver, trackLevelUp, trackKitCollected, trackQuizAttempt, trackQuizPass, trackQuizFail, trackTutorialViewed, trackSocialShare, trackEducationExpanded, trackDeepDiveViewed } from '@/lib/analytics'
import { getQuizForLevel, type QuizChallenge, type QuizItem } from '@/lib/game/inGameQuizzes'
import { calculateTotalKits } from '@/lib/game/utils'
import { PLAYER_CONFIG, GAME_CONFIG, KIT_CONFIG, QUIZ_CONFIG, VISUAL_CONFIG, ALL_KIT_TYPES, getKitIcon } from '@/lib/game/gameConstants'
import { ObjectPool } from '@/lib/game/objectPool'
import { createInputState, createKeyboardHandlers, createTouchHandlers, createClickHandler } from '@/lib/game/gameInput'
import { checkCollisions } from '@/lib/game/collisionDetection'
import { getCurrentUser, getLeaderboard, setUsername as apiSetUsername, signIn, signUp, signOut, submitRun, recordShare, getActiveContests, type BackendUser, type Contest } from '@/lib/api/backend'
import { useQuizState } from './hooks/useQuizState'
import { useTutorialState } from './hooks/useTutorialState'
import { useUIState } from './hooks/useUIState'
import { LoadingScreen } from './ui/LoadingScreen'
import { TutorialOverlay } from './ui/TutorialOverlay'
import { StartScreenNew } from './ui/StartScreenNew'
import QuizModal from './QuizModal'

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  type: string
  color: string
  threatId: string
  sentBy: GhostPlayer
  category: string
  spawnTime?: number
  active?: boolean
}

interface RecoveryOverlayState {
  threatName: string
  protectionName: string
  whatItStops: string[]
  realWorldEquivalents: string[]
  tipText: string
  timeLeft: number
  progress: number
}

export default function SimpleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [level, setLevel] = useState(1)
  const [bonusKitType, setBonusKitType] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [savedGameState, setSavedGameState] = useState<{level: number, kits: {[key:string]:number}, score: number} | null>(null)
  const [isFirstDeath, setIsFirstDeath] = useState(true)
  const [deathAction, setDeathAction] = useState<'restart' | 'quiz'>('restart')
  const [authStatus, setAuthStatus] = useState<'checking' | 'guest' | 'authed'>('checking')
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState(false)
  const [activeContests, setActiveContests] = useState<Contest[]>([])
  const [recoveryOverlay, setRecoveryOverlay] = useState<RecoveryOverlayState | null>(null)
  const [showRecoveryDetails, setShowRecoveryDetails] = useState(false)
  const showQuizOverlayRef = useRef(false)
  
  // Track all timeouts for cleanup to prevent memory leaks
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  
  // Use custom hooks for state management
  const quiz = useQuizState()
  const tutorial = useTutorialState()
  const ui = useUIState()
  const router = useRouter()
  
  const { distance, score, isGameOver, lastAttacker, lastThreatType, setDistance, setScore, setGameOver, setRunning, setLastAttacker, resetGame, addLeaderboardEntry, setLeaderboard } = useGameStore()

  const buildRecoveryOverlayState = (kitType: string, threatId: string | null): Omit<RecoveryOverlayState, 'timeLeft' | 'progress'> => {
    const protectionKit = getProtectionKitById(kitType)
    const threatName = threatId ? getThreatName(threatId) : 'Privacy Threat'
    const threatData = threatId
      ? threatTypes.find((threat) => threat.id === threatId) ?? null
      : null

    return {
      threatName,
      protectionName: protectionKit?.name ?? 'Protection Kit',
      whatItStops: threatData?.educationalContent?.slice(0, 3) ?? [
        'Reduce exposure',
        'Block common attacks',
        'Keep data safe'
      ],
      realWorldEquivalents: protectionKit?.howToGetIt?.slice(0, 3) ?? [
        'Use trusted tools',
        'Enable built-in protections',
        'Follow best practices'
      ],
      tipText: (threatData?.educationalContent?.[0] ?? 'Review your privacy settings regularly.'),
    }
  }

  
  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load auth state (guest vs signed-in)
  useEffect(() => {
    let isActive = true

    const loadUser = async () => {
      try {
        const user = await getCurrentUser()
        if (!isActive) return
        if (user) {
          setCurrentUser(user)
          setAuthStatus('authed')
        } else {
          setCurrentUser(null)
          setAuthStatus('guest')
        }
      } catch {
        if (!isActive) return
        setCurrentUser(null)
        setAuthStatus('guest')
      }
    }

    loadUser()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    showQuizOverlayRef.current = showQuiz
  }, [showQuiz])

  // Load active contests
  useEffect(() => {
    let isActive = true

    const loadContests = async () => {
      try {
        const contests = await getActiveContests()
        if (!isActive) return
        setActiveContests(contests)
      } catch (error) {
        console.error('Failed to load contests:', error)
      }
    }

    loadContests()
    return () => {
      isActive = false
    }
  }, [])

  // Load leaderboard from backend
  useEffect(() => {
    let isActive = true

    const loadLeaderboard = async () => {
      try {
        const entries = await getLeaderboard(50)
        if (!isActive) return
        const mapped: LeaderboardEntry[] = entries.map((entry, index) => ({
          id: `remote_${index}_${entry.createdAt}`,
          name: entry.username,
          score: entry.score,
          distance: entry.distance,
          createdAt: new Date(entry.createdAt).getTime()
        }))
        setLeaderboard(mapped.slice(0, 10)) // Sync top 10 to game store for display
      } catch {
        if (!isActive) return
      }
    }

    loadLeaderboard()
    return () => {
      isActive = false
    }
  }, [])
  
  // Show bonus notification when bonus kit is awarded
  useEffect(() => {
    if (bonusKitType) {
      ui.actions.showBonus(5000)
      const tid = setTimeout(() => setBonusKitType(null), 100)
      timeoutRefs.current.push(tid)
    }
  }, [bonusKitType])

  // Auto-start game if ?play=true in URL
  useEffect(() => {
    if (!isMounted || isLoading || gameStarted) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const shouldAutoStart = urlParams.get('play') === 'true'
    
    if (shouldAutoStart) {
      console.log('🎮 Auto-starting game from URL parameter')
      // Small delay to ensure everything is loaded
      const tid = setTimeout(() => {
        handleStart()
        // Clean URL after starting
        router.replace('/')
      }, 100)
      return () => clearTimeout(tid)
    }
  }, [isMounted, isLoading, gameStarted])

  // Preload sprites and show loading screen
  useEffect(() => {
    if (!isMounted) return
    
    const images = {
      virus: new Image(),
      firewall: new Image(),
      malware: new Image(),
      dataBreach: new Image(),
      spamWave: new Image(),
      dataPacket: new Image(),
      background: new Image()
    }
    
    let loadedCount = 0
    const totalImages = Object.keys(images).length
    
    const handleImageLoad = () => {
      loadedCount++
      setLoadProgress((loadedCount / totalImages) * 100)
      if (loadedCount === totalImages) {
        const tid = setTimeout(() => setIsLoading(false), 2000)
        timeoutRefs.current.push(tid)
      }
    }
    
    // Set up load handlers and start loading
    Object.values(images).forEach(img => {
      img.onload = handleImageLoad
      img.onerror = handleImageLoad // Count errors as loaded to prevent hanging
    })
    
    // Load images
    images.virus.src = '/assets/sprites/virus.png'
    images.firewall.src = '/assets/sprites/firewall.png'
    images.malware.src = '/assets/sprites/malware.png'
    images.dataBreach.src = '/assets/sprites/data-breach.png'
    images.spamWave.src = '/assets/sprites/spam-wave.png'
    images.dataPacket.src = '/assets/sprites/data-packet.png'
    images.background.src = '/space-background-final.png'
    
    return () => {
      // Clean up image references to prevent memory leaks
      Object.values(images).forEach(img => {
        img.src = ''
        img.onload = null
        img.onerror = null
      })
    }
  }, [isMounted])
  
  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const EMOJI_FONT_STACK = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",monospace'
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)
    const performanceMode = isChrome
    
    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false
    
    // Make fullscreen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Load sprite images (player is now animated stick figure, no sprite needed)
    const images = {
      virus: new Image(),
      firewall: new Image(),
      malware: new Image(),
      dataBreach: new Image(),
      spamWave: new Image(),
      dataPacket: new Image(),
      background: new Image()
    }
    
    images.virus.src = '/assets/sprites/virus.png'
    images.firewall.src = '/assets/sprites/firewall.png'
    images.malware.src = '/assets/sprites/malware.png'
    images.dataBreach.src = '/assets/sprites/data-breach.png'
    images.spamWave.src = '/assets/sprites/spam-wave.png'
    images.dataPacket.src = '/assets/sprites/data-packet.png'
    images.background.src = '/space-background-final.png'
    
    // Map threat types to sprites
    const threatToSprite: { [key: string]: HTMLImageElement } = {
      'weak-password': images.firewall,
      'password-reuse': images.firewall,
      'phishing-email': images.spamWave,
      'spear-phishing': images.spamWave,
      'zero-day': images.malware,
      'unpatched-vuln': images.malware,
      'doxing-attack': images.dataBreach,
      'data-harvester': images.dataBreach,
      'evil-twin': images.virus
    }

    const categoryToSprite: Record<ThreatCategory, HTMLImageElement> = {
      password: images.firewall,
      phishing: images.spamWave,
      updates: images.malware,
      privacy: images.dataBreach,
      wifi: images.virus,
      authentication: images.firewall,
      'data-loss': images.dataBreach,
      'social-engineering': images.spamWave,
      'physical-security': images.firewall,
      'secure-disposal': images.dataBreach,
      policy: images.firewall,
      'incident-reporting': images.dataBreach,
      compliance: images.firewall,
      'remote-work': images.virus,
      'meeting-security': images.spamWave,
      'travel-security': images.virus,
      'data-protection': images.dataBreach,
      'supply-chain': images.malware,
      'insider-threats': images.dataBreach,
      'email-security': images.spamWave,
      'data-classification': images.firewall,
      'social-media': images.dataBreach,
      'removable-media': images.malware
    }
    
    // Gradient cache for background (Chrome performance optimization)
    let cachedGradient: CanvasGradient | null = null
    let cachedGradientWidth = 0
    let cachedGradientHeight = 0
    
    // Game state
    let animationId: number
    let gameTime = 0 // Track game time for spawn timestamps
    let lastHitThreatId: string | null = null
    let playerX = 100 // Start on left
    let playerY = canvas.height / 2
    let playerSize = 45 // Bigger player for better visibility
    let playerSpeed = 5
    let localScore = savedGameState ? savedGameState.score : 0 // Restore score if continuing from quiz
    
    // Level state
    let currentLevel = savedGameState ? savedGameState.level : 1 // Restore level if continuing from quiz
    let obstacleSpeed = 4
    let powerupsNeeded = 0
    let powerupsCollected = 0
    let isAdvancingLevel = false // Prevent multiple level advances
    let spawnFrequency = 620 // ms between obstacle spawns (reduced threat density)
    let speedFactor = 0.55
    let threatSpeedFactor = 0.38
    let spawnFactor = 1.1
    let kitSpawnTimer = 0
    const KIT_SPAWN_INTERVAL = 4000 // ms between kits (more frequent)
    let effectiveObstacleSpeed = obstacleSpeed
    let effectivePlayerSpeed = playerSpeed
    let effectiveSpawnFrequency = spawnFrequency
    
    // Animation state for running character
    let animationTime = 0
    let playerTilt = 0 // Character tilt angle (-15 to 15 degrees)
    let previousPlayerX = playerX // Track previous position for movement detection
    let previousPlayerY = playerY
    
    // Celebration state
    let celebrationTimer = 0
    const CELEBRATION_DURATION = 300 // ms
    
    // Confetti particle system
    interface ConfettiParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      rotation: number
      rotationSpeed: number
      life: number
      shape: 'rect' | 'circle'
      size: number
    }
    let confettiParticles: ConfettiParticle[] = []
    
    // Victory dance state
    let isVictoryDancing = false
    let victoryDanceTimer = 0
    const VICTORY_DANCE_DURATION = 2000 // 2 seconds
    
    // Color cache for ghost player names (avoids parseInt on every frame)
    const colorCache = new Map<string, {r: number, g: number, b: number}>()
    function hexToRgb(hex: string): {r: number, g: number, b: number} {
      if (colorCache.has(hex)) {
        return colorCache.get(hex)!
      }
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const rgb = { r, g, b }
      colorCache.set(hex, rgb)
      return rgb
    }
    
    // Confetti spawning function
    function spawnConfetti(x: number, y: number, count: number) {
      const colors = ['#00ff88', '#00ffff', '#ffff00', '#ff00ff', '#ff0080', '#0080ff', '#80ff00']
      const isMobile = canvas.width < 768
      const maxParticles = isMobile ? 30 : 60 // Limit particles on mobile
      
      // Don't exceed max particles
      if (confettiParticles.length >= maxParticles) return
      
      const spawnCount = Math.min(count, maxParticles - confettiParticles.length)
      
      for (let i = 0; i < spawnCount; i++) {
        const angle = (Math.PI * 2 * i) / spawnCount + (Math.random() - 0.5) * 0.5
        const speed = 3 + Math.random() * 4
        confettiParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3, // Upward bias
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          life: 1,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
          size: isMobile ? 4 + Math.random() * 4 : 6 + Math.random() * 6
        })
      }
    }
    
    // Update confetti particles
    function updateConfetti(frameMs: number) {
      const gravity = 0.15
      const decay = 0.015
      
      // Normalize to 60fps (16.67ms per frame)
      const timeScale = frameMs / 16.67
      
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const particle = confettiParticles[i]
        
        // Update physics (scaled by time)
        particle.vy += gravity * timeScale
        particle.x += particle.vx * timeScale
        particle.y += particle.vy * timeScale
        particle.rotation += particle.rotationSpeed * timeScale
        particle.life -= decay * timeScale
        
        // Remove dead particles
        if (particle.life <= 0 || particle.y > canvas.height + 50) {
          confettiParticles.splice(i, 1)
        }
      }
    }
    
    // Draw confetti particles
    function drawConfetti() {
      for (const particle of confettiParticles) {
        ctx.save()
        ctx.globalAlpha = particle.life
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillStyle = particle.color
        
        if (particle.shape === 'rect') {
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()
      }
    }
    
    let obstacles: GameObject[] = []
    let powerups: GameObject[] = []
    let keys: { [key: string]: boolean } = {}
    let lastSpawn = 0
    
    // Object pooling: pre-create 50 obstacle objects to reuse
    const obstaclePool: GameObject[] = Array(50).fill(null).map(() => ({
      x: 0,
      y: -1000,
      width: 50,
      height: 50,
      vx: 0,
      vy: 0,
      type: '',
      color: '#ffffff',
      threatId: '',
      sentBy: { id: '', name: '', level: 0, speciality: '', category: 'password' },
      category: '',
      spawnTime: 0,
      active: false
    }))
    
    function getObstacleFromPool(): GameObject | null {
      const result = obstaclePool.find(obj => !obj.active) || null
      return result
    }
    
    function returnObstacleToPool(obstacle: GameObject) {
      obstacle.active = false
      obstacle.y = -1000 // Move off screen
    }
    
    // Kit inventory system - all protection kits
    const createEmptyInventory = () => {
      return ALL_KIT_TYPES.reduce((acc, kitId) => {
        acc[kitId] = 0
        return acc
      }, {} as Record<string, number>)
    }
    // Restore from saved state if continuing from quiz pass
    const baseInventory = createEmptyInventory()
    let kitInventory = savedGameState ? {
      ...baseInventory,
      ...savedGameState.kits
    } : baseInventory
    if (!savedGameState && bonusKitType && kitInventory[bonusKitType] !== undefined) {
      kitInventory[bonusKitType] = 1
    }
    const MAX_KIT_CAPACITY = KIT_CONFIG.MAX_CAPACITY
    
    // Tutorial overlay state
    let showingTutorial = false
    let tutorialKit = ''
    let tutorialTimer = 0
    const TUTORIAL_DURATION = 7000 // 7 seconds - longer for reading
    
    // Healing state - player frozen during tutorial
    let isHealing = false
    
    // Quiz completion message state
    let showQuizCompletionMessage = false
    let quizCompletionSuccess = false
    let quizCompletionTimer = 0
    
    // Backup restoration state (extra life mechanic)
    let isRestoring = false
    let restorationTimer = 0
    const RESTORATION_DURATION = 3000 // 3 seconds
    
    // Total kits collected for rank progression
    let totalKitsCollected = 0
    
    // Level-up overlay state
    let showingLevelUp = false
    let levelUpTimer = 0
    const LEVEL_UP_DURATION = 2000 // 2 seconds
    
    // Background animation
    let bgOffset = 0
    let particles: Array<{ x: number; y: number; size: number; speed: number }> = []
    
    // Matrix rain for high levels
    let matrixColumns: Array<{ x: number; y: number; speed: number; chars: string[] }> = []
    
    // Sector transition state
    let showingSectorChange = false
    let sectorChangeTimer = 0
    let sectorChangeName = ''
    const SECTOR_CHANGE_DURATION = 2000 // 2 seconds
    
    // Create background particles
    // Reduced particle count for Chrome performance
    const particleCount = performanceMode ? 20 : 100
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1 + 0.5
      })
    }
    
    // Create matrix columns (for level 10+)
    const matrixCount = performanceMode ? 30 : 50
    for (let i = 0; i < matrixCount; i++) {
      matrixColumns.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 3 + 1,
        chars: '01アイウエオカキクケコサシスセソタチツテト'.split('')
      })
    }
    
    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // ===== MOBILE TOUCH CONTROLS =====
    let touchStartX = 0
    let touchStartY = 0
    let isTouching = false
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      
      // Check if tap is on mobile HUD (for toggling)
      if (canvas.width < 768) { // Mobile
        const hudX = canvas.width - (ui.state.mobileHudExpanded ? 130 : 110)
        const hudY = 80
        const hudWidth = ui.state.mobileHudExpanded ? 130 : 100
        const hudHeight = ui.state.mobileHudExpanded ? 210 : 80
        
        // Check if touch is within HUD bounds
        if (
          touch.clientX >= hudX && 
          touch.clientX <= hudX + hudWidth &&
          touch.clientY >= hudY && 
          touch.clientY <= hudY + hudHeight
        ) {
          // Toggle HUD (timer management handled by hook)
          ui.actions.setMobileHudExpanded(!ui.state.mobileHudExpanded)
          
          return // Don't process as player movement
        }
      }
      
      isTouching = true
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching) return
      // Prevent movement when player is frozen (healing, tutorial, or restoring)
      if (isHealing || showingTutorial || isRestoring) return
      e.preventDefault()
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY
      
      // Update player position based on touch movement (drag to move)
      playerX += deltaX * 0.8 // Smooth, responsive movement
      playerY += deltaY * 0.8
      
      // Update touch start position for continuous movement
      touchStartX = touch.clientX
      touchStartY = touch.clientY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      isTouching = false
    }
    
    // Mouse click handler for HUD toggle (useful for testing on desktop)
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      
      if (canvas.width < 768) { // Mobile viewport
        const hudX = canvas.width - (ui.state.mobileHudExpanded ? 130 : 110)
        const hudY = 80
        const hudWidth = ui.state.mobileHudExpanded ? 130 : 100
        const hudHeight = ui.state.mobileHudExpanded ? 210 : 80
        
        // Check if click is within HUD bounds
        if (
          clickX >= hudX && 
          clickX <= hudX + hudWidth &&
          clickY >= hudY && 
          clickY <= hudY + hudHeight
        ) {
          // Toggle HUD (timer management handled by hook)
          ui.actions.setMobileHudExpanded(!ui.state.mobileHudExpanded)
        }
      } else {
        // Desktop viewport - toggle desktop HUD
        const hudX = 20
        const hudY = 80
        const collapsedHudWidth = 340
        const collapsedHudHeight = 70
        const kitColumns = 8
        const kitRows = Math.ceil(ALL_KIT_TYPES.length / kitColumns)
        const expandedHudWidth = 460
        const expandedHudHeight = 90 + (kitRows * 24)
        const hudWidth = ui.state.desktopHudExpanded ? expandedHudWidth : collapsedHudWidth
        const hudHeight = ui.state.desktopHudExpanded ? expandedHudHeight : collapsedHudHeight
        
        // Check if click is within auth label area first (top left of HUD)
        const authBoxWidth = 180
        const authBoxHeight = 15
        const authBoxX = hudX + 10
        const authBoxY = hudY + 2

        if (
          clickX >= authBoxX &&
          clickX <= authBoxX + authBoxWidth &&
          clickY >= authBoxY &&
          clickY <= authBoxY + authBoxHeight
        ) {
          if (authStatus === 'authed') {
            handleSignOut()
          } else {
            setShowAuthModal(true)
          }
          return
        }

        // Check if click is within HUD bounds
        if (
          clickX >= hudX && 
          clickX <= hudX + hudWidth &&
          clickY >= hudY && 
          clickY <= hudY + hudHeight
        ) {
          // Toggle HUD
          ui.actions.setDesktopHudExpanded(!ui.state.desktopHudExpanded)
        }
      }
    }
    
    // Add touch listeners to canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false })
    canvas.addEventListener('click', handleCanvasClick)
    
    // ===== BOSS BATTLE FUNCTIONS =====
    
    // Kit spawning function - all types
    function spawnKit() {
      const kitType = ALL_KIT_TYPES[Math.floor(Math.random() * ALL_KIT_TYPES.length)]
      
      // Get kit data for accurate colors
      const kitData = getProtectionKitById(kitType)
      
      // Spawn kit at random position
      const kit: GameObject = {
        x: Math.random() * (canvas.width - 200) + 100,
        y: Math.random() * (canvas.height - 200) + 100,
        width: 35,
        height: 35,
        vx: 0,
        vy: 0,
        type: `kit-${kitType}`,
        color: kitData?.color || '#00ffff',
        threatId: kitType,
        sentBy: { id: '', name: '', level: 0, speciality: '', category: 'password' },
        category: kitData?.protectsAgainst || ''
      }
      
      powerups.push(kit)
    }
    
    // Map threats to their required protection kit
    function getRequiredKit(threatId: string): keyof typeof kitInventory {
      const kitMap: { [key: string]: keyof typeof kitInventory } = {
        'weak-password': 'password-manager',
        'password-reuse': 'password-manager',
        'phishing-email': 'link-analyzer',
        'spear-phishing': 'link-analyzer',
        'zero-day': 'patch-manager',
        'unpatched-vuln': 'patch-manager',
        'doxing-attack': 'privacy-optimizer',
        'data-harvester': 'privacy-optimizer',
        'malicious-app': 'privacy-optimizer',
        'permission-abuse': 'privacy-optimizer',
        'evil-twin': 'vpn-shield',
        'credential-stuffing': 'mfa-authenticator',
        'session-hijacking': 'mfa-authenticator',
        'sim-swap': 'mfa-authenticator',
        'ransomware': 'backup-system',
        'hardware-failure': 'backup-system',
        'pretexting': 'social-engineering-defense',
        'baiting-attack': 'social-engineering-defense',
        'tailgating': 'badge-tap',
        'shoulder-surfing': 'badge-tap',
        'unlocked-workstation': 'badge-tap',
        'document-theft': 'badge-tap',
        'improper-disposal': 'secure-shred',
        'dumpster-diving': 'secure-shred',
        'policy-violation': 'policy-knowledge',
        'unauthorized-software': 'policy-knowledge',
        'delayed-reporting': 'ethics-reporting',
        'wrong-channel': 'ethics-reporting',
        'incomplete-details': 'ethics-reporting',
        'retaliation-threat': 'ethics-reporting',
        'gdpr-violation': 'compliance-kit',
        'hipaa-breach': 'compliance-kit',
        'pci-noncompliance': 'compliance-kit',
        'unsecured-home-router': 'remote-work-guard',
        'family-device': 'remote-work-guard',
        'weak-home-wifi': 'remote-work-guard',
        'zoom-bombing': 'waiting-room',
        'meeting-link-leak': 'waiting-room',
        'hotel-wifi': 'travel-vpn',
        'public-kiosk': 'travel-vpn',
        'unencrypted-storage': 'encryption-kit',
        'over-shared-data': 'encryption-kit',
        'vendor-breach': 'sbom-toolkit',
        'compromised-update': 'sbom-toolkit',
        'malicious-package': 'sbom-toolkit',
        'accidental-data-share': 'insider-monitor',
        'privilege-abuse': 'insider-monitor',
        'data-exfiltration': 'insider-monitor',
        'malicious-attachment': 'email-gateway',
        'bec-scam': 'email-gateway',
        'email-spoofing': 'email-gateway',
        'misclassified-data': 'classification-labeler',
        'wrong-sharing-channel': 'classification-labeler',
        'oversharing-work-info': 'privacy-check',
        'location-tagging': 'privacy-check',
        'recon-posting': 'privacy-check',
        'usb-drop': 'device-control',
        'unauthorized-device': 'device-control',
        'usb-data-theft': 'device-control',
        'juice-jacking': 'device-control',
      }
      
      return kitMap[threatId] || 'password-manager'
    }
    
    // Show tutorial overlay when kit is used (healing process)
    function showTutorial(kitType: string, threatId?: string) {
      showingTutorial = true
      tutorialKit = kitType
      tutorialTimer = TUTORIAL_DURATION
      if (threatId) {
        lastHitThreatId = threatId
        setLastAttacker(lastAttacker ?? null as any, threatId)
      }
      isHealing = true // Freeze player during healing

      // Mobile uses a React bottom sheet for readability.
      if (canvas.width < 640) {
        const threatIdForOverlay = threatId || lastThreatType || null
        const overlayBase = buildRecoveryOverlayState(kitType, threatIdForOverlay)
        setRecoveryOverlay({
          ...overlayBase,
          timeLeft: Math.max(0, Math.ceil(TUTORIAL_DURATION / 1000)),
          progress: 0,
        })
        setShowRecoveryDetails(false)
      }
    }
    
    // Calculate kits needed for next level (based on total kit types)
    // Level 1→2: 1 of each type
    // Level 2→3: 2 of each type
    // Level 3→4: 3 of each type
    function calculateKitsNeededForNextLevel(level: number): number {
      return level * ALL_KIT_TYPES.length
    }
    
    function drawRecoveryOverlayForKit() {
      const protectionKit = getProtectionKitById(tutorialKit)
      const protectionName = protectionKit?.name ?? 'Protection Kit'
      const threatIdForOverlay = lastHitThreatId || lastThreatType || null
      const threatName = threatIdForOverlay ? getThreatName(threatIdForOverlay) : 'Privacy Threat'
      const threatData = threatIdForOverlay
        ? threatTypes.find((threat) => threat.id === threatIdForOverlay) ?? null
        : null
      const learningPoints = threatData?.educationalContent?.slice(0, 3) ?? [
        'Reduce exposure',
        'Block common attacks',
        'Keep data safe'
      ]
      const equivalents = protectionKit?.howToGetIt?.slice(0, 3) ?? [
        'Use trusted tools',
        'Enable built-in protections',
        'Follow best practices'
      ]
      const tipText = learningPoints[0] ?? 'Review your privacy settings regularly.'
      const progress = Math.max(0, Math.min(1, 1 - tutorialTimer / TUTORIAL_DURATION))
      const timeLeft = Math.max(0, Math.ceil(tutorialTimer / 1000))
      const scale = Math.min(1, canvas.width / 900, canvas.height / 720)
      const panelW = Math.min(canvas.width * 0.86, 760 * scale)
      const panelH = Math.min(canvas.height * 0.72, 520 * scale)
      const panelX = (canvas.width - panelW) / 2
      const panelY = (canvas.height - panelH) / 2
      const padding = 28 * scale

      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + h - r)
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        ctx.lineTo(x + r, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
      }

      // Backdrop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Panel
      ctx.save()
      ctx.shadowBlur = 30 * scale
      ctx.shadowColor = 'rgba(0, 220, 255, 0.35)'
      roundRect(panelX, panelY, panelW, panelH, 18 * scale)
      ctx.fillStyle = 'rgba(5, 16, 24, 0.92)'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.lineWidth = 2 * scale
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.7)'
      ctx.stroke()
      ctx.restore()

      // Header icon + title
      ctx.textAlign = 'center'
      ctx.font = `bold ${34 * scale}px monospace`
      ctx.fillStyle = '#7be9ff'
      ctx.fillText('🛡️', canvas.width / 2, panelY + padding + 10 * scale)
      ctx.font = `bold ${28 * scale}px monospace`
      ctx.fillStyle = '#7be9ff'
      ctx.fillText('Recovery in Progress', canvas.width / 2, panelY + padding + 48 * scale)
      ctx.font = `${14 * scale}px monospace`
      ctx.fillStyle = '#9fb7c9'
      ctx.fillText('You were hit by a privacy threat — protection activated.', canvas.width / 2, panelY + padding + 72 * scale)

      // Divider line
      ctx.strokeStyle = 'rgba(0, 180, 220, 0.35)'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.moveTo(panelX + padding, panelY + padding + 90 * scale)
      ctx.lineTo(panelX + panelW - padding, panelY + padding + 90 * scale)
      ctx.stroke()

      // Threat / Protection row
      ctx.textAlign = 'left'
      const rowY = panelY + padding + 110 * scale
      ctx.font = `bold ${14 * scale}px monospace`
      ctx.fillStyle = '#ffcc66'
      ctx.fillText('⚠️ Threat:', panelX + padding, rowY)
      ctx.fillStyle = '#dfe9f2'
      ctx.fillText(threatName, panelX + padding, rowY + 22 * scale)

      ctx.fillStyle = '#7ee0a2'
      ctx.fillText('🛡️ Protection Used:', panelX + panelW / 2, rowY)
      ctx.fillStyle = '#dfe9f2'
      ctx.fillText(protectionName, panelX + panelW / 2, rowY + 22 * scale)

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ')
        let line = ''
        let lines = 0
        for (const word of words) {
          const testLine = `${line}${word} `
          if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, y + lines * lineHeight)
            line = `${word} `
            lines += 1
          } else {
            line = testLine
          }
        }
        if (line) {
          ctx.fillText(line, x, y + lines * lineHeight)
          lines += 1
        }
        return lines
      }

      // What it stops
      const listY = rowY + 52 * scale
      const leftColX = panelX + padding
      const rightColX = panelX + panelW / 2
      const colWidth = panelW / 2 - padding * 1.1
      const lineHeight = 16 * scale

      ctx.fillStyle = '#9fb7c9'
      ctx.font = `bold ${14 * scale}px monospace`
      ctx.fillText('What it stops:', leftColX, listY)
      ctx.font = `${13 * scale}px monospace`
      let leftLines = 0
      learningPoints.forEach((item, idx) => {
        const y = listY + 20 * scale + leftLines * lineHeight
        ctx.fillStyle = '#7ee0a2'
        ctx.fillText('✓', leftColX, y)
        ctx.fillStyle = '#dfe9f2'
        leftLines += wrapText(item, leftColX + 18 * scale, y, colWidth - 18 * scale, lineHeight)
      })

      // Real-world equivalents
      ctx.fillStyle = '#9fb7c9'
      ctx.font = `bold ${14 * scale}px monospace`
      ctx.fillText('Real-world equivalents:', rightColX, listY)
      ctx.font = `${13 * scale}px monospace`
      let rightLines = 0
      equivalents.forEach((item) => {
        const y = listY + 20 * scale + rightLines * lineHeight
        ctx.fillStyle = '#7ee0a2'
        ctx.fillText('✓', rightColX, y)
        ctx.fillStyle = '#dfe9f2'
        rightLines += wrapText(item, rightColX + 18 * scale, y, colWidth - 18 * scale, lineHeight)
      })

      // Tip
      const maxLines = Math.max(leftLines, rightLines)
      const tipY = listY + 24 * scale + maxLines * lineHeight + 8 * scale
      ctx.fillStyle = '#cfd7e3'
      ctx.font = `bold ${13 * scale}px monospace`
      ctx.fillText('Tip:', panelX + padding, tipY)
      ctx.font = `${13 * scale}px monospace`
      ctx.fillStyle = '#9fb7c9'
      ctx.fillText(tipText, panelX + padding + 36 * scale, tipY)

      // Progress label
      ctx.textAlign = 'center'
      ctx.font = `bold ${15 * scale}px monospace`
      ctx.fillStyle = '#9fb7c9'
      ctx.fillText(`Recovery completes in ${timeLeft}s`, canvas.width / 2, panelY + panelH - 60 * scale)

      // Progress bar
      const barW = panelW - padding * 2
      const barH = 14 * scale
      const barX = panelX + padding
      const barY = panelY + panelH - 38 * scale
      roundRect(barX, barY, barW, barH, 8 * scale)
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)'
      ctx.lineWidth = 1 * scale
      ctx.stroke()
      roundRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4, 6 * scale)
      ctx.fillStyle = 'rgba(0, 255, 180, 0.8)'
      ctx.fill()

      // Small avatar bubble
      ctx.font = `${16 * scale}px monospace`
      ctx.fillStyle = '#ffcc66'
      ctx.beginPath()
      ctx.arc(barX + 12 * scale, barY - 10 * scale, 10 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1b2533'
      ctx.fillText('🙂', barX + 6 * scale, barY - 4 * scale)

      ctx.textAlign = 'left'
    }

    // Draw tutorial overlay (healing process - freezes player)
    function drawTutorialOverlay() {
      if (!showingTutorial || tutorialTimer <= 0) {
        showingTutorial = false
        isHealing = false // End healing - player can move again
        setRecoveryOverlay(null)
        setShowRecoveryDetails(false)
        return
      }

      const isMobileRecoverySheet = canvas.width < 640
      if (!isMobileRecoverySheet) {
        drawRecoveryOverlayForKit()
      } else {
        const timeLeft = Math.max(0, Math.ceil(tutorialTimer / 1000))
        const progress = Math.max(0, Math.min(1, 1 - tutorialTimer / TUTORIAL_DURATION))
        const threatIdForOverlay = lastHitThreatId || lastThreatType || null
        const overlayBase = buildRecoveryOverlayState(tutorialKit, threatIdForOverlay)
        setRecoveryOverlay((prev) => {
          if (
            prev &&
            prev.timeLeft === timeLeft &&
            Math.abs(prev.progress - progress) < 0.02 &&
            prev.threatName === overlayBase.threatName &&
            prev.protectionName === overlayBase.protectionName
          ) {
            return prev
          }
          return {
            ...overlayBase,
            timeLeft,
            progress,
          }
        })
      }
      tutorialTimer -= 16
      return
      
      // Blur + dim background to focus on tutorial
      ctx.save()
      ctx.filter = 'blur(3px)'
      ctx.globalAlpha = 0.7
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()
      
      let title = ''
      let subtitle = ''
      let blocks = ''
      let tool = ''
      let tip = ''
      
      if (tutorialKit === 'password-manager') {
        title = '🔐 HEALING IN PROGRESS...'
        subtitle = 'PASSWORD MANAGER DEPLOYED'
        blocks = 'Weak passwords, credential stuffing, brute force attacks'
        tool = 'Real tools: Bitwarden, 1Password, Dashlane, KeePass'
        tip = 'Use unique passwords (16+ characters) for every account'
      } else if (tutorialKit === 'link-analyzer') {
        title = '🔗 HEALING IN PROGRESS...'
        subtitle = 'LINK ANALYZER ACTIVATED'
        blocks = 'Phishing emails, spear phishing, malicious URLs, typosquatting'
        tool = 'Real tools: VirusTotal, URLScan.io, Malwarebytes Browser Guard'
        tip = 'Always hover over links to preview URLs before clicking'
      } else if (tutorialKit === 'patch-manager') {
        title = '🛡️ HEALING IN PROGRESS...'
        subtitle = 'PATCH MANAGER DEPLOYED'
        blocks = 'Zero-day exploits, unpatched vulnerabilities, outdated software'
        tool = 'Real tools: Windows Update, WSUS, SCCM, unattended-upgrades'
        tip = 'Enable automatic updates for all software and OS'
      } else if (tutorialKit === 'privacy-optimizer') {
        title = '🕵️ HEALING IN PROGRESS...'
        subtitle = 'PRIVACY OPTIMIZER ACTIVATED'
        blocks = 'Doxing attacks, data harvesting, personal info leakage'
        tool = 'Real tools: ExifTool, Jumbo Privacy, DeleteMe'
        tip = 'Remove photo metadata and lock down social media privacy settings'
      } else if (tutorialKit === 'vpn-shield') {
        title = '🔒 HEALING IN PROGRESS...'
        subtitle = 'VPN SHIELD DEPLOYED'
        blocks = 'Evil twin WiFi, man-in-the-middle, public network snooping'
        tool = 'Real tools: Mullvad VPN, ProtonVPN, Cloudflare WARP'
        tip = 'Always use VPN on public WiFi networks'
      } else if (tutorialKit === 'mfa-authenticator') {
        title = '🔑 HEALING IN PROGRESS...'
        subtitle = 'MFA AUTHENTICATOR ACTIVATED'
        blocks = 'Credential stuffing, session hijacking, automated takeovers'
        tool = 'Real tools: Authy, Google Authenticator, Microsoft Authenticator'
        tip = 'Enable MFA on all important accounts - blocks 99% of attacks'
      } else if (tutorialKit === 'backup-system') {
        title = '💾 HEALING IN PROGRESS...'
        subtitle = 'BACKUP SYSTEM DEPLOYED'
        blocks = 'Ransomware, hardware failure, accidental deletion'
        tool = 'Real tools: Backblaze, iDrive, Time Machine, File History'
        tip = 'Follow 3-2-1 rule: 3 copies, 2 media types, 1 offsite'
      } else if (tutorialKit === 'social-engineering-defense') {
        title = '🎭 HEALING IN PROGRESS...'
        subtitle = 'SOCIAL ENGINEERING DEFENSE ACTIVE'
        blocks = 'Pretexting, baiting, impersonation, manipulation'
        tool = 'Real training: KnowBe4, SANS Security Awareness'
        tip = 'Verify unexpected requests through a different channel'
      } else if (tutorialKit === 'badge-tap') {
        title = '🪪 HEALING IN PROGRESS...'
        subtitle = 'BADGE TAP ACTIVE'
        blocks = 'Tailgating, shoulder surfing, unlocked workstations'
        tool = 'Real tools: Access badges, visitor escorts, door logs'
        tip = 'Do not hold secure doors for strangers'
      } else if (tutorialKit === 'secure-shred') {
        title = '🗑️ HEALING IN PROGRESS...'
        subtitle = 'SECURE SHRED ACTIVE'
        blocks = 'Improper disposal, dumpster diving, paper leaks'
        tool = 'Real tools: Cross-cut shredders, secure bins'
        tip = 'Shred sensitive documents before disposal'
      } else if (tutorialKit === 'policy-knowledge') {
        title = '📘 HEALING IN PROGRESS...'
        subtitle = 'POLICY KNOWLEDGE ACTIVE'
        blocks = 'Policy violations, unauthorized tools, risky behavior'
        tool = 'Real tools: Acceptable use policies, training'
        tip = 'Use only approved apps and services'
      } else if (tutorialKit === 'ethics-reporting') {
        title = '📣 HEALING IN PROGRESS...'
        subtitle = 'ETHICS REPORTING ACTIVE'
        blocks = 'Delayed reporting, wrong channel, retaliation risk'
        tool = 'Real tools: Incident hotlines, reporting portals'
        tip = 'Report incidents immediately with key details'
      } else if (tutorialKit === 'compliance-kit') {
        title = '⚖️ HEALING IN PROGRESS...'
        subtitle = 'COMPLIANCE KIT ACTIVE'
        blocks = 'GDPR, HIPAA, PCI violations, regulatory fines'
        tool = 'Real tools: Data labels, audits, approved storage'
        tip = 'Follow rules for regulated data handling'
      } else if (tutorialKit === 'remote-work-guard') {
        title = '🏡 HEALING IN PROGRESS...'
        subtitle = 'REMOTE WORK GUARD ACTIVE'
        blocks = 'Weak home WiFi, insecure routers, family devices'
        tool = 'Real tools: VPN, router updates, guest networks'
        tip = 'Secure home networks and separate devices'
      } else if (tutorialKit === 'waiting-room') {
        title = '🛎️ HEALING IN PROGRESS...'
        subtitle = 'WAITING ROOM ACTIVE'
        blocks = 'Meeting intrusions, leaked links, uninvited guests'
        tool = 'Real tools: Meeting passwords, lobbies'
        tip = 'Enable waiting rooms and lock meetings'
      } else if (tutorialKit === 'travel-vpn') {
        title = '🧳 HEALING IN PROGRESS...'
        subtitle = 'TRAVEL VPN ACTIVE'
        blocks = 'Hotel WiFi traps, public kiosk risks'
        tool = 'Real tools: VPN clients, mobile hotspots'
        tip = 'Use VPN on all travel networks'
      } else if (tutorialKit === 'encryption-kit') {
        title = '🔏 HEALING IN PROGRESS...'
        subtitle = 'ENCRYPTION KIT ACTIVE'
        blocks = 'Unencrypted storage, over-shared data'
        tool = 'Real tools: BitLocker, FileVault, encrypted sharing'
        tip = 'Encrypt sensitive data at rest and in transit'
      } else if (tutorialKit === 'sbom-toolkit') {
        title = '📦 HEALING IN PROGRESS...'
        subtitle = 'SBOM TOOLKIT ACTIVE'
        blocks = 'Vendor breaches, malicious packages, bad updates'
        tool = 'Real tools: SBOM scanners, dependency checks'
        tip = 'Verify and scan software components'
      } else if (tutorialKit === 'insider-monitor') {
        title = '👁️ HEALING IN PROGRESS...'
        subtitle = 'INSIDER MONITOR ACTIVE'
        blocks = 'Accidental shares, privilege abuse, data exfiltration'
        tool = 'Real tools: DLP, audit logs, least privilege'
        tip = 'Monitor access and limit permissions'
      } else if (tutorialKit === 'email-gateway') {
        title = '📧 HEALING IN PROGRESS...'
        subtitle = 'EMAIL GATEWAY ACTIVE'
        blocks = 'Malicious attachments, BEC, email spoofing'
        tool = 'Real tools: Secure email gateways, sandboxing'
        tip = 'Scan attachments and verify senders'
      } else if (tutorialKit === 'classification-labeler') {
        title = '🏷️ HEALING IN PROGRESS...'
        subtitle = 'CLASSIFICATION LABELER ACTIVE'
        blocks = 'Misclassified data, wrong sharing channels'
        tool = 'Real tools: Data labels, access policies'
        tip = 'Label data before sharing'
      } else if (tutorialKit === 'privacy-check') {
        title = '🕶️ HEALING IN PROGRESS...'
        subtitle = 'PRIVACY CHECK ACTIVE'
        blocks = 'Oversharing, location tagging, recon posts'
        tool = 'Real tools: Privacy settings, post reviews'
        tip = 'Avoid posting sensitive work details'
      } else if (tutorialKit === 'device-control') {
        title = '🔌 HEALING IN PROGRESS...'
        subtitle = 'DEVICE CONTROL ACTIVE'
        blocks = 'USB drops, unauthorized devices, data theft'
        tool = 'Real tools: Device control policies, DLP'
        tip = 'Block unknown USB devices'
      }
      
      // Full screen semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Center panel - responsive width for mobile
      const isMobile = canvas.width < 768
      const panelWidth = isMobile ? Math.min(canvas.width - 40, 350) : Math.min(canvas.width - 100, 800)
      const panelHeight = isMobile ? 380 : 350
      const panelX = canvas.width / 2 - panelWidth / 2
      const panelY = canvas.height / 2 - panelHeight / 2
      
      ctx.fillStyle = 'rgba(0, 20, 40, 0.95)'
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
      
      // Pulsing border for healing effect
      const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + pulse * 0.5})`
      ctx.lineWidth = 4
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00ffff'
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)
      ctx.shadowBlur = 0
      
      // Warning message
      ctx.font = isMobile ? 'bold 14px monospace' : 'bold 20px monospace'
      ctx.fillStyle = '#ff6600'
      ctx.textAlign = 'center'
      ctx.fillText('⚠️ PLAYER FROZEN - READING REQUIRED ⚠️', canvas.width / 2, panelY + 40)
      
      // Title
      ctx.font = isMobile ? 'bold 20px monospace' : 'bold 32px monospace'
      ctx.fillStyle = '#00ff00'
      ctx.fillText(title, canvas.width / 2, panelY + (isMobile ? 75 : 85))
      
      // Subtitle
      ctx.font = isMobile ? 'bold 16px monospace' : 'bold 22px monospace'
      ctx.fillStyle = '#00ffff'
      ctx.fillText(subtitle, canvas.width / 2, panelY + (isMobile ? 105 : 120))
      
      // Content - smaller font for mobile, with text wrapping
      ctx.font = isMobile ? '13px monospace' : '18px monospace'
      ctx.fillStyle = '#ffffff'
      
      // Wrap text for mobile
      const blocksText = `What it blocks: ${blocks}`
      if (isMobile && ctx.measureText(blocksText).width > panelWidth - 20) {
        const words = blocksText.split(' ')
        let line = ''
        let yPos = panelY + 145
        for (const word of words) {
          const testLine = line + word + ' '
          if (ctx.measureText(testLine).width > panelWidth - 20 && line !== '') {
            ctx.fillText(line, canvas.width / 2, yPos)
            line = word + ' '
            yPos += 18
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, canvas.width / 2, yPos)
      } else {
        ctx.fillText(blocksText, canvas.width / 2, panelY + 165)
      }
      
      ctx.font = isMobile ? '13px monospace' : '18px monospace'
      ctx.fillStyle = '#aaffaa'
      
      // Wrap tool text for mobile
      if (isMobile && ctx.measureText(tool).width > panelWidth - 20) {
        const words = tool.split(' ')
        let line = ''
        let yPos = panelY + 185
        for (const word of words) {
          const testLine = line + word + ' '
          if (ctx.measureText(testLine).width > panelWidth - 20 && line !== '') {
            ctx.fillText(line, canvas.width / 2, yPos)
            line = word + ' '
            yPos += 18
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, canvas.width / 2, yPos)
      } else {
        ctx.fillText(tool, canvas.width / 2, panelY + 200)
      }
      
      ctx.font = isMobile ? 'bold 14px monospace' : 'bold 20px monospace'
      ctx.fillStyle = '#ffff00'
      
      // Wrap tip text for mobile
      const tipText = `💡 ${tip}`
      if (isMobile && ctx.measureText(tipText).width > panelWidth - 20) {
        const words = tipText.split(' ')
        let line = ''
        let yPos = panelY + 235
        for (const word of words) {
          const testLine = line + word + ' '
          if (ctx.measureText(testLine).width > panelWidth - 20 && line !== '') {
            ctx.fillText(line, canvas.width / 2, yPos)
            line = word + ' '
            yPos += 18
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, canvas.width / 2, yPos)
      } else {
        ctx.fillText(tipText, canvas.width / 2, panelY + 245)
      }
      
      // Progress/timer bar with countdown - responsive width
      const timePercent = tutorialTimer / TUTORIAL_DURATION
      const barWidth = isMobile ? panelWidth - 40 : Math.min(700, panelWidth - 100)
      const barHeight = 20
      const barX = canvas.width / 2 - barWidth / 2
      const barY = panelY + (isMobile ? 310 : 285)
      
      ctx.fillStyle = '#222222'
      ctx.fillRect(barX, barY, barWidth, barHeight)
      ctx.fillStyle = `rgba(0, 255, 255, ${0.7 + pulse * 0.3})`
      ctx.fillRect(barX, barY, barWidth * timePercent, barHeight)
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 2
      ctx.strokeRect(barX, barY, barWidth, barHeight)
      
      // Countdown text
      const secondsLeft = Math.ceil(tutorialTimer / 1000)
      ctx.font = 'bold 16px monospace'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(`Reading time: ${secondsLeft}s`, canvas.width / 2, barY + 40)
      
      ctx.textAlign = 'left'
      
      tutorialTimer -= 16 // Decrease by frame time
    }
    
    // Draw level-up overlay
    function drawLevelUpOverlay() {
      // Don't show level up overlay during quiz
      if (quiz.refs.activeRef.current) {
        return
      }
      
      if (!showingLevelUp || levelUpTimer <= 0) {
        showingLevelUp = false
        return
      }
      
      // Pulsing effect
      const pulse = Math.sin(Date.now() / 100) * 0.2 + 0.8
      
      // Full screen flash effect
      ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * (levelUpTimer / LEVEL_UP_DURATION)})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Center overlay
      const overlayWidth = 500
      const overlayHeight = 200
      const overlayX = canvas.width / 2 - overlayWidth / 2
      const overlayY = canvas.height / 2 - overlayHeight / 2
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight)
      
      // Glowing border
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 4
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ffd700'
      ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight)
      ctx.shadowBlur = 0
      
      // Title with pulse effect
      ctx.font = `bold ${Math.floor(48 * pulse)}px monospace`
      ctx.fillStyle = '#ffd700'
      ctx.textAlign = 'center'
      ctx.fillText('LEVEL UP!', canvas.width / 2, canvas.height / 2 - 40)
      
      // Level number
      ctx.font = 'bold 36px monospace'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(`Level ${currentLevel}`, canvas.width / 2, canvas.height / 2 + 10)
      
      // Rank
      const rank = getRank()
      ctx.font = 'bold 24px monospace'
      ctx.fillStyle = '#00ffff'
      ctx.fillText(`Rank: ${rank}`, canvas.width / 2, canvas.height / 2 + 50)
      
      // New direction indicator
      let directionInfo = ''
      if (currentLevel === 2) {
        directionInfo = '⬇️ NEW: Obstacles from BOTTOM!'
      } else if (currentLevel === 3) {
        directionInfo = '➡️ NEW: Obstacles from RIGHT!'
      } else if (currentLevel === 4) {
        directionInfo = '⬅️ NEW: Obstacles from LEFT!'
      } else if (currentLevel > 4) {
        directionInfo = '🔥 All directions active!'
      }
      
      ctx.font = '18px monospace'
      ctx.fillStyle = '#ff6600'
      ctx.fillText(directionInfo || 'Difficulty Increased!', canvas.width / 2, canvas.height / 2 + 85)
      
      ctx.textAlign = 'left'
      
      // Decrement timer
      levelUpTimer -= 16
    }
    
    // Draw sector/zone change overlay (ENTERING NEW ZONE!)
    function drawSectorChangeOverlay() {
      if (!showingSectorChange || sectorChangeTimer <= 0) {
        showingSectorChange = false
        return
      }
      
      // Get current zone
      const zone = getCurrentZone(currentLevel)
      const isZoneChange = isZoneTransition(currentLevel)
      
      // Dramatic flash effect for zone transitions
      const flashOpacity = sectorChangeTimer / SECTOR_CHANGE_DURATION
      const flashIntensity = isZoneChange ? 0.4 : 0.2
      ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * flashOpacity})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Pulsing effect
      const pulse = Math.sin(Date.now() / 80) * 0.3 + 0.7
      
      // Giant zone name with zone color
      ctx.font = `bold ${Math.floor(isZoneChange ? 84 : 72) * pulse}px monospace`
      ctx.fillStyle = zone.colorScheme.accent
      ctx.textAlign = 'center'
      ctx.shadowBlur = isZoneChange ? 50 : 30
      ctx.shadowColor = zone.colorScheme.accent
      ctx.fillText(sectorChangeName, canvas.width / 2, canvas.height / 2)
      ctx.shadowBlur = 0
      
      // Warning text for zone transitions
      if (isZoneChange) {
        ctx.font = 'bold 32px monospace'
        ctx.fillStyle = '#ffaa00'
        ctx.fillText('⚠️ ZONE TRANSITION ⚠️', canvas.width / 2, canvas.height / 2 - 100)
        
        // Zone description
        ctx.font = 'bold 20px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(zone.description, canvas.width / 2, canvas.height / 2 + 80)
        
        // New threats warning
        ctx.font = '16px monospace'
        ctx.fillStyle = '#ff6666'
        const primaryThreats = zone.primaryThreats.map(t => t.toUpperCase()).join(', ')
        ctx.fillText(`Primary Threats: ${primaryThreats}`, canvas.width / 2, canvas.height / 2 + 110)
      } else {
        // Regular level-up message
        ctx.font = 'bold 24px monospace'
        ctx.fillStyle = '#ffaa00'
        ctx.fillText('⚠️ ENVIRONMENT CHANGE ⚠️', canvas.width / 2, canvas.height / 2 - 80)
      }
      
      ctx.textAlign = 'left'
    }
    
    // Draw backup restoration overlay (EXTRA LIFE MECHANIC!)
    function drawRestorationOverlay() {
      if (!isRestoring || restorationTimer <= 0) {
        isRestoring = false
        return
      }
 
      const protectionKit = lastThreatType ? getProtectionKitForThreat(lastThreatType) : null
      const threatName = lastThreatType ? getThreatName(lastThreatType) : 'Unknown Threat'
      const protectionName = protectionKit ? protectionKit.name : 'Protection Kit'
      const learningPoints = protectionKit?.learningPoints?.slice(0, 3) ?? [
        'Reduce exposure',
        'Block common attacks',
        'Keep data safe'
      ]
      const equivalents = protectionKit?.howToGetIt?.slice(0, 3) ?? [
        'Use trusted tools',
        'Enable built-in protections',
        'Follow best practices'
      ]
      const tipText = protectionKit?.learningPoints?.[0] ?? 'Review your privacy settings regularly.'
      const progress = Math.max(0, Math.min(1, 1 - restorationTimer / RESTORATION_DURATION))
      const timeLeft = Math.max(0, Math.ceil(restorationTimer / 1000))
      const scale = Math.min(1, canvas.width / 900, canvas.height / 720)
      const panelW = Math.min(canvas.width * 0.86, 760 * scale)
      const panelH = Math.min(canvas.height * 0.78, 620 * scale)
      const panelX = (canvas.width - panelW) / 2
      const panelY = (canvas.height - panelH) / 2
      const padding = 28 * scale
 
      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + h - r)
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        ctx.lineTo(x + r, y + h)
        ctx.quadraticCurveTo(x, y + h, x, y + h - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
      }
 
      // Backdrop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
 
      // Panel
      ctx.save()
      ctx.shadowBlur = 30 * scale
      ctx.shadowColor = 'rgba(0, 220, 255, 0.35)'
      roundRect(panelX, panelY, panelW, panelH, 18 * scale)
      ctx.fillStyle = 'rgba(5, 16, 24, 0.92)'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.lineWidth = 2 * scale
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.7)'
      ctx.stroke()
      ctx.restore()
 
      // Header icon + title
      ctx.textAlign = 'center'
      ctx.font = `bold ${34 * scale}px monospace`
      ctx.fillStyle = '#7be9ff'
      ctx.fillText('🛡️', canvas.width / 2, panelY + padding + 10 * scale)
      ctx.font = `bold ${28 * scale}px monospace`
      ctx.fillStyle = '#7be9ff'
      ctx.fillText('Recovery in Progress', canvas.width / 2, panelY + padding + 48 * scale)
      ctx.font = `${14 * scale}px monospace`
      ctx.fillStyle = '#9fb7c9'
      ctx.fillText('You were hit by a privacy threat — protection activated.', canvas.width / 2, panelY + padding + 72 * scale)
 
      // Divider line
      ctx.strokeStyle = 'rgba(0, 180, 220, 0.35)'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.moveTo(panelX + padding, panelY + padding + 90 * scale)
      ctx.lineTo(panelX + panelW - padding, panelY + padding + 90 * scale)
      ctx.stroke()
 
      // Threat / Protection row
      ctx.textAlign = 'left'
      const rowY = panelY + padding + 120 * scale
      ctx.font = `bold ${14 * scale}px monospace`
      ctx.fillStyle = '#ffcc66'
      ctx.fillText('⚠️ Threat:', panelX + padding, rowY)
      ctx.fillStyle = '#dfe9f2'
      ctx.fillText(threatName, panelX + padding, rowY + 22 * scale)
 
      ctx.fillStyle = '#7ee0a2'
      ctx.fillText('🛡️ Protection Used:', panelX + panelW / 2, rowY)
      ctx.fillStyle = '#dfe9f2'
      ctx.fillText(protectionName, panelX + panelW / 2, rowY + 22 * scale)
 
      // What it stops
      const listY = rowY + 65 * scale
      ctx.fillStyle = '#9fb7c9'
      ctx.font = `bold ${14 * scale}px monospace`
      ctx.fillText('What it stops:', panelX + padding, listY)
      ctx.font = `${13 * scale}px monospace`
      learningPoints.forEach((item, idx) => {
        const y = listY + 24 * scale + idx * 22 * scale
        ctx.fillStyle = '#7ee0a2'
        ctx.fillText('✓', panelX + padding, y)
        ctx.fillStyle = '#dfe9f2'
        ctx.fillText(item, panelX + padding + 18 * scale, y)
      })
 
      // Real-world equivalents
      const rightColX = panelX + panelW / 2
      ctx.fillStyle = '#9fb7c9'
      ctx.font = `bold ${14 * scale}px monospace`
      ctx.fillText('Real-world equivalents:', rightColX, listY)
      ctx.font = `${13 * scale}px monospace`
      equivalents.forEach((item, idx) => {
        const y = listY + 24 * scale + idx * 22 * scale
        ctx.fillStyle = '#7ee0a2'
        ctx.fillText('✓', rightColX, y)
        ctx.fillStyle = '#dfe9f2'
        ctx.fillText(item, rightColX + 18 * scale, y)
      })
 
      // Tip
      const tipY = listY + 24 * scale + 3 * 22 * scale + 12 * scale
      ctx.fillStyle = '#cfd7e3'
      ctx.font = `bold ${13 * scale}px monospace`
      ctx.fillText('Tip:', panelX + padding, tipY)
      ctx.font = `${13 * scale}px monospace`
      ctx.fillStyle = '#9fb7c9'
      ctx.fillText(tipText, panelX + padding + 36 * scale, tipY)
 
      // Progress label
      ctx.textAlign = 'center'
      ctx.font = `bold ${15 * scale}px monospace`
      ctx.fillStyle = '#9fb7c9'
      ctx.fillText(`Recovery completes in ${timeLeft}s`, canvas.width / 2, panelY + panelH - 70 * scale)
 
      // Progress bar
      const barW = panelW - padding * 2
      const barH = 14 * scale
      const barX = panelX + padding
      const barY = panelY + panelH - 48 * scale
      roundRect(barX, barY, barW, barH, 8 * scale)
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)'
      ctx.lineWidth = 1 * scale
      ctx.stroke()
      roundRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4, 6 * scale)
      ctx.fillStyle = 'rgba(0, 255, 180, 0.8)'
      ctx.fill()
 
      // Small avatar bubble
      ctx.font = `${16 * scale}px monospace`
      ctx.fillStyle = '#ffcc66'
      ctx.beginPath()
      ctx.arc(barX + 12 * scale, barY - 10 * scale, 10 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1b2533'
      ctx.fillText('🙂', barX + 6 * scale, barY - 4 * scale)
 
      ctx.textAlign = 'left'
 
      // Decrement timer
      restorationTimer -= 16
    }
    
    // Draw quiz completion message
    function drawQuizCompletionMessage() {
      if (!showQuizCompletionMessage || quizCompletionTimer <= 0) {
        showQuizCompletionMessage = false
        return
      }
      
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
      const isMobile = canvas.width < 768
      
      // Flash effect
      if (quizCompletionSuccess) {
        ctx.fillStyle = `rgba(0, 255, 0, ${0.3 * (quizCompletionTimer / 2000)})`
      } else {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * (quizCompletionTimer / 2000)})`
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Message box
      const overlayWidth = isMobile ? 320 : 600
      const overlayHeight = isMobile ? 180 : 240
      const overlayX = canvas.width / 2 - overlayWidth / 2
      const overlayY = canvas.height / 2 - overlayHeight / 2
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
      ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight)
      
      // Border
      ctx.strokeStyle = quizCompletionSuccess ? '#00ff00' : '#ff0000'
      ctx.lineWidth = 4
      ctx.shadowBlur = 20
      ctx.shadowColor = quizCompletionSuccess ? '#00ff00' : '#ff0000'
      ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight)
      ctx.shadowBlur = 0
      
      // Message
      ctx.font = `bold ${Math.floor((isMobile ? 32 : 48) * pulse)}px monospace`
      ctx.fillStyle = quizCompletionSuccess ? '#00ff00' : '#ff0000'
      ctx.textAlign = 'center'
      ctx.fillText(
        quizCompletionSuccess ? '✅ QUIZ PASSED!' : '❌ QUIZ FAILED',
        canvas.width / 2,
        canvas.height / 2 - (isMobile ? 30 : 40)
      )
      
      // Score display
      const finalPoints = quiz.refs.pointsRef.current
      const passingScore = quiz.refs.currentQuizRef.current?.passingScore || 50
      ctx.font = `bold ${isMobile ? 24 : 32}px monospace`
      ctx.fillStyle = '#ffff00'
      ctx.fillText(`${finalPoints} / ${passingScore} Points`, canvas.width / 2, canvas.height / 2 + (isMobile ? 5 : 10))
      
      // Sub text
      ctx.font = `bold ${isMobile ? 16 : 24}px monospace`
      ctx.fillStyle = '#ffffff'
      if (quizCompletionSuccess) {
        ctx.fillText('Keep Your Gear! +500 Points', canvas.width / 2, canvas.height / 2 + (isMobile ? 40 : 60))
      } else {
        ctx.fillText('All Powerups Lost!', canvas.width / 2, canvas.height / 2 + (isMobile ? 40 : 60))
      }
      
      ctx.textAlign = 'left'
      
      // Decrement timer
      quizCompletionTimer -= 16
    }
    
    // Get rank based on total kits collected
    function getRank() {
      if (totalKitsCollected < 10) return 'Newbie'
      if (totalKitsCollected < 30) return 'Analyst'
      if (totalKitsCollected < 60) return 'Expert'
      return 'Commando'
    }
    
    // In-game quiz functions
    function startInGameQuiz(quizChallenge: QuizChallenge) {
      // Activate quiz through hook action
      // Use React state 'level' instead of local 'currentLevel' to avoid savedGameState timing issues
      quiz.actions.startQuiz(level)
      
      // IMMEDIATELY clear all obstacles for safety
      obstacles.length = 0
      
      // Spawn quiz items after countdown (3 seconds)
      const tid = setTimeout(() => {
        if (quiz.refs.activeRef.current) {
          spawnQuizItems(quizChallenge)
        }
      }, 3000)
      timeoutRefs.current.push(tid)
    }
    
    function endInGameQuiz(success: boolean) {
      
      quiz.actions.markCompleted()
      
      if (success) {
        // Reward for passing quiz (no speed increase - we want consistent difficulty)
        if (quiz.refs.currentQuizRef.current) {
          // No speed bonus - speed stays constant in early levels
          // obstacleSpeed *= quiz.refs.currentQuizRef.current.speedBonus // REMOVED
          localScore += 500 // Bonus points for completing quiz
          
          // Show success message
          showQuizCompletionMessage = true
          quizCompletionSuccess = true
          quizCompletionTimer = 2000
          
          // Big confetti burst for quiz pass!
          const isMobile = canvas.width < 768
          spawnConfetti(canvas.width / 2, canvas.height / 2, isMobile ? 40 : 80)
          
          // Victory dance
          isVictoryDancing = true
          victoryDanceTimer = VICTORY_DANCE_DURATION
        }
      } else {
        // FAIL: Show failure message (player loses gear is handled elsewhere)
        showQuizCompletionMessage = true
        quizCompletionSuccess = false
        quizCompletionTimer = 2000
      }
      
      // Clear quiz items from powerups array
      powerups = powerups.filter(p => p.type !== 'quiz-item')
      
      // Reset quiz state after brief delay
      const tid = setTimeout(() => {
        quiz.actions.endQuiz()
        showQuizCompletionMessage = false
      }, 2000)
      timeoutRefs.current.push(tid)
    }
    
    function spawnQuizItems(quizChallenge: QuizChallenge) {
      // Clear existing powerups
      powerups.length = 0
      
      // Spawn quiz items in a well-spaced 2x3 grid (like mockup)
      const itemWidth = 120
      const itemHeight = 120
      const horizontalSpacing = 450 // Much wider spacing
      const verticalSpacing = 350 // Taller spacing
      const startX = (canvas.width - (horizontalSpacing * 2)) / 2
      const startY = (canvas.height - (verticalSpacing * 1)) / 2 - 50 // Center better
      
      quizChallenge.items.forEach((item, index) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        
        powerups.push({
          x: startX + (col * horizontalSpacing),
          y: startY + (row * verticalSpacing),
          width: itemWidth,
          height: itemHeight,
          vx: 0,
          vy: 0,
          type: 'quiz-item',
          color: item.color,
          threatId: item.id,
          sentBy: { id: item.id, name: item.label, level: 0, speciality: item.visual, category: 'password' },
          category: quizChallenge.type
        })
      })
    }
    
    function checkQuizCompletion() {
      
      if (!quiz.refs.currentQuizRef.current || !quiz.refs.activeRef.current || quiz.refs.completedRef.current || quiz.refs.countdownRef.current > 0) {
        return
      }
      
      // Check if all quiz items have been collected or time ran out
      const allItemsGone = powerups.filter(p => p.type === 'quiz-item').length === 0
      
      
      if (allItemsGone || quiz.refs.timeRemainingRef.current <= 0) {
        // Use point-based system to determine pass/fail
        const currentPoints = quiz.refs.pointsRef.current
        const passingScore = quiz.refs.currentQuizRef.current.passingScore
        const success = currentPoints >= passingScore
        
        endInGameQuiz(success)
      }
    }
    
    function advanceLevel() {
      // Prevent multiple simultaneous level advances
      if (isAdvancingLevel) return
      isAdvancingLevel = true
      
      currentLevel++
      setLevel(currentLevel)
      
      // Spawn at random safe position (not too close to edges)
      playerX = 200 + Math.random() * (canvas.width - 400)
      playerY = 200 + Math.random() * (canvas.height - 400)
      
      // NEW DIFFICULTY PROGRESSION:
      // Levels 1-4: Speed stays constant, difficulty comes from directional complexity
      // Level 1: Top only
      // Level 2: Top + Bottom
      // Level 3: Top + Bottom + Right (+ Password Quiz!)
      // Level 4: All 4 directions
      // Level 5+: Gradual speed increases resume
      
      if (currentLevel <= 4) {
        // Levels 1-4: Keep base speed constant, only very minor spawn frequency changes
        // Difficulty comes purely from adding new threat directions
        spawnFrequency = Math.max(580, spawnFrequency - 10) // Gentle spawn increase only
      } else if (isZoneTransition(currentLevel)) {
        // Zone transitions (levels 7, 10, etc): Major difficulty spike
        obstacleSpeed += 0.8
        spawnFrequency = Math.max(260, spawnFrequency - 60)
      } else {
        // After level 4: Gradual speed and spawn increases
        obstacleSpeed += 0.25
        spawnFrequency = Math.max(320, spawnFrequency - 15)
      }
      
      // Show level-up overlay
      showingLevelUp = true
      levelUpTimer = LEVEL_UP_DURATION
      
      // Trigger ZONE TRANSITION at levels 4, 7, 10 (zone boundaries!)
      if (isZoneTransition(currentLevel)) {
        const zone = getCurrentZone(currentLevel)
        sectorChangeName = zone.name
        showingSectorChange = true
        sectorChangeTimer = SECTOR_CHANGE_DURATION * 1.5 // Longer for zone transitions
      }
      
      // Trigger in-game quiz at certain levels
      const quizChallenge = getQuizForLevel(currentLevel)
      if (quizChallenge && !quiz.refs.activeRef.current) {
        const tid1 = setTimeout(() => {
          startInGameQuiz(quizChallenge)
        }, 2000)
        timeoutRefs.current.push(tid1)
      }
      
      // Reset flag after a short delay
      const tid2 = setTimeout(() => {
        isAdvancingLevel = false
      }, 1000)
      timeoutRefs.current.push(tid2)
    }
    
    function spawnPowerups() {
      for (let i = 0; i < powerupsNeeded; i++) {
        powerups.push({
          x: Math.random() * (canvas.width - 200) + 100,
          y: Math.random() * (canvas.height - 200) + 100,
          width: 25,
          height: 25,
          vx: 0,
          vy: 0,
          type: 'powerup',
          color: '#00ff00',
          threatId: '',
          sentBy: { id: '', name: '', level: 0, speciality: '', category: 'password' },
          category: ''
        })
      }
    }
    
    // Educational overlay removed - using tutorial overlay instead
    
    // Get weighted random threat based on current zone
    function getZoneWeightedThreat(): ThreatType {
      // Import all threats
      const { threatTypes } = require('@/lib/game/threatData')
      
      // Create weighted array based on zone relevance
      const weightedThreats: ThreatType[] = []
      
      threatTypes.forEach((threat: ThreatType) => {
        const weight = getThreatSpawnWeight(threat.category, currentLevel)
        // Add threat multiple times based on weight
        for (let i = 0; i < Math.floor(weight * 2); i++) {
          weightedThreats.push(threat)
        }
      })
      
      // Return random threat from weighted array
      return weightedThreats[Math.floor(Math.random() * weightedThreats.length)]
    }
    
    // Spawn obstacles from different directions based on level
    function spawnObstacle() {
      // Try to get object from pool
      const obstacle = getObstacleFromPool()
      if (!obstacle) return // Pool exhausted, skip this spawn
      
      // Calculate speed based on level
      // Levels 1-4: No speed scaling (difficulty from directions only)
      const speedMultiplier = currentLevel <= 4 ? 1.0 : (1 + (currentLevel * 0.1))
      
      // Select zone-weighted threat type and matching ghost player
      const threat = getZoneWeightedThreat()
      const ghostPlayer = getRandomGhostPlayer(threat.category)
      
      // Determine spawn direction based on level
      let spawnDirection = 'top' // Default: Level 1 - top only
      const availableDirections = ['top']
      
      if (currentLevel >= 2) {
        availableDirections.push('bottom') // Level 2: top + bottom
      }
      if (currentLevel >= 3) {
        availableDirections.push('right') // Level 3: top + bottom + right
      }
      if (currentLevel >= 4) {
        availableDirections.push('left') // Level 4+: all sides
      }
      
      // Randomly select from available directions
      spawnDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)]
      
      // Reuse the pooled object instead of creating new one
      obstacle.active = true
      obstacle.width = 40 + Math.random() * 20
      obstacle.height = 40 + Math.random() * 20
      
      // Set position and velocity based on spawn direction
      switch (spawnDirection) {
        case 'top':
          obstacle.x = Math.random() * canvas.width
          obstacle.y = -50
          obstacle.vx = (Math.random() - 0.5) * 2 // Slight horizontal drift
          obstacle.vy = effectiveObstacleSpeed * speedMultiplier
          break
        case 'bottom':
          obstacle.x = Math.random() * canvas.width
          obstacle.y = canvas.height + 50
          obstacle.vx = (Math.random() - 0.5) * 2
          obstacle.vy = -effectiveObstacleSpeed * speedMultiplier // Move upward
          break
        case 'right':
          obstacle.x = canvas.width + 50
          obstacle.y = Math.random() * canvas.height
          obstacle.vx = -effectiveObstacleSpeed * speedMultiplier // Move leftward
          obstacle.vy = (Math.random() - 0.5) * 2
          break
        case 'left':
          obstacle.x = -50
          obstacle.y = Math.random() * canvas.height
          obstacle.vx = effectiveObstacleSpeed * speedMultiplier // Move rightward
          obstacle.vy = (Math.random() - 0.5) * 2
          break
      }
      
      obstacle.type = threat.id
      obstacle.color = threat.color
      obstacle.threatId = threat.id
      obstacle.sentBy = ghostPlayer
      obstacle.category = threat.category
      obstacle.spawnTime = gameTime
      
      obstacles.push(obstacle)
    }
    
    // Collision detection
    function checkCollision(obj1: { x: number; y: number; width: number; height: number }, 
                           obj2: { x: number; y: number; width: number; height: number }): boolean {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      )
    }
    
    // Get color scheme based on zone/level
    function getBackgroundColorScheme(level: number) {
      const zone = getCurrentZone(level)
      
      // Special Matrix Mode for Cloud Zone level 15+
      if (level >= 15) {
        const cycle = (Date.now() / 3000) % 4
        const baseScheme = zone.colorScheme
        return {
          gradient1: baseScheme.primary,
          gradient2: baseScheme.secondary,
          gridColor: baseScheme.gridColor,
          particleColor: baseScheme.particleColor,
          name: '☁️ MATRIX MODE'
        }
      }
      
      return {
        gradient1: zone.colorScheme.primary,
        gradient2: zone.colorScheme.secondary,
        gridColor: zone.colorScheme.gridColor,
        particleColor: zone.colorScheme.particleColor,
        name: zone.colorScheme.name
      }
    }
    
    // Render quiz overlay UI
    function renderQuizOverlay() {
      if (!quiz.refs.currentQuizRef.current) return
      
      const quizData = quiz.refs.currentQuizRef.current
      const countdown = quiz.refs.countdownRef.current
      const isMobile = canvas.width < 768
      
      // Show countdown intro before actual quiz
      if (countdown > 0) {
        // Full screen dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Pulsing countdown number
        const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7
        ctx.font = `bold ${Math.floor((isMobile ? 120 : 180) * pulse)}px monospace`
        ctx.fillStyle = '#00ffff'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 40
        ctx.shadowColor = '#00ffff'
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2)
        
        // "Get Ready" text
        ctx.font = `bold ${isMobile ? 20 : 32}px monospace`
        ctx.fillStyle = '#ffff00'
        ctx.shadowBlur = 10
        ctx.fillText('⚡ SECURITY CHALLENGE INCOMING ⚡', canvas.width / 2, canvas.height / 2 - 120)
        
        // Quiz type
        ctx.font = `bold ${isMobile ? 18 : 24}px monospace`
        ctx.fillStyle = '#ffffff'
        ctx.fillText(quizData.question, canvas.width / 2, canvas.height / 2 + 100)
        
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
        return // Don't render quiz items during countdown
      }
      
      // Draw background first (so grid and cards appear on top of cosmic space)
      // Background is already drawn in main game loop, just add darker overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw 3D perspective grid floor (like mockup)
      ctx.save()
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)'
      ctx.lineWidth = isMobile ? 1 : 2
      const gridSize = isMobile ? 40 : 60
      const gridStartY = canvas.height * 0.65
      const vanishX = canvas.width / 2
      const vanishY = canvas.height * 0.3
      
      // Vertical lines with perspective
      for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, gridStartY)
        // Create perspective by converging lines toward vanishing point
        const perspectiveX = vanishX + (i - vanishX) * 0.3
        ctx.lineTo(perspectiveX, canvas.height)
        ctx.stroke()
      }
      
      // Horizontal lines with depth
      const numHorizontalLines = Math.floor((canvas.height - gridStartY) / gridSize)
      for (let i = 0; i <= numHorizontalLines; i++) {
        const y = gridStartY + (i * gridSize)
        const depthFactor = i / numHorizontalLines
        const leftX = vanishX - (vanishX * depthFactor)
        const rightX = vanishX + (canvas.width - vanishX) * depthFactor
        ctx.beginPath()
        ctx.moveTo(leftX, y)
        ctx.lineTo(rightX, y)
        ctx.stroke()
      }
      ctx.restore()
      
      // Header banner
      const bannerHeight = isMobile ? 90 : 120
      ctx.fillStyle = 'rgba(10, 27, 63, 0.95)'
      ctx.fillRect(0, 0, canvas.width, bannerHeight)
      
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 3
      ctx.strokeRect(0, 0, canvas.width, bannerHeight)
      
      // Title
      ctx.font = `bold ${isMobile ? 20 : 32}px monospace`
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(quizData.question, canvas.width / 2, isMobile ? 30 : 40)
      
      // Instructions with point values
      ctx.font = `bold ${isMobile ? 14 : 18}px monospace`
      ctx.fillStyle = '#00ff9c'
      ctx.fillText(`COLLECT STRONG +${quizData.pointsForCorrect}`, canvas.width / 2, isMobile ? 52 : 70)
      ctx.fillStyle = '#ff4d4d'
      ctx.fillText(`AVOID WEAK ${quizData.pointsForIncorrect}`, canvas.width / 2, isMobile ? 72 : 95)
      
      // Score display (top-left) - Large and prominent
      ctx.textAlign = 'left'
      ctx.font = `bold ${isMobile ? 28 : 42}px monospace`
      ctx.fillStyle = '#6ee7ff'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#00ffff'
      const scoreText = quiz.state.points.toString().padStart(2, '0')
      ctx.fillText(`⚡ ${scoreText}`, isMobile ? 20 : 40, isMobile ? 150 : 180)
      ctx.shadowBlur = 0
      
      // Timer display (top-right) - Large and prominent
      ctx.textAlign = 'right'
      const timeWarning = quiz.state.timeRemaining < 10
      ctx.fillStyle = timeWarning ? '#ff4d4d' : '#6ee7ff'
      ctx.shadowBlur = timeWarning ? 15 : 10
      ctx.shadowColor = timeWarning ? '#ff0000' : '#00ffff'
      const minutes = Math.floor(quiz.state.timeRemaining / 60)
      const seconds = quiz.state.timeRemaining % 60
      ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, canvas.width - (isMobile ? 20 : 40), isMobile ? 150 : 180)
      ctx.shadowBlur = 0
      
      // Combo indicator (bottom-right)
      if (quiz.state.combo > 0) {
        ctx.textAlign = 'right'
        ctx.font = `bold ${isMobile ? 24 : 36}px monospace`
        ctx.fillStyle = '#ffff00'
        ctx.shadowBlur = 15
        ctx.shadowColor = '#ffff00'
        const comboMultiplier = Math.min(quiz.state.combo, 4)
        ctx.fillText(`${comboMultiplier}x COMBO`, canvas.width - (isMobile ? 20 : 40), canvas.height - (isMobile ? 100 : 140))
        
        // Combo counter
        ctx.font = `bold ${isMobile ? 16 : 20}px monospace`
        ctx.fillStyle = '#ffffff'
        const comboText = Array.from({length: quiz.state.combo}, (_, i) => `+${i+1}`).join(', ')
        ctx.fillText(comboText, canvas.width - (isMobile ? 20 : 40), canvas.height - (isMobile ? 75 : 105))
        ctx.shadowBlur = 0
      }
      
      // Educational tip at bottom
      ctx.textAlign = 'center'
      ctx.font = `bold ${isMobile ? 14 : 18}px monospace`
      ctx.fillStyle = '#ffffff'
      ctx.shadowBlur = 3
      ctx.shadowColor = '#000000'
      ctx.fillText(quizData.educationalNote, canvas.width / 2, canvas.height - (isMobile ? 45 : 60))
      
      // Controls reminder
      ctx.font = `${isMobile ? 12 : 16}px monospace`
      ctx.fillStyle = '#aaaaaa'
      const controlsText = isMobile ? '📱 Swipe to Move' : '💻 WASD to Move'
      ctx.fillText(controlsText, canvas.width / 2, canvas.height - (isMobile ? 25 : 35))
      ctx.shadowBlur = 0
      ctx.textAlign = 'left'
      
      // Render quiz items as 3D cards with enhanced visuals (matching mockup exactly)
      powerups.forEach(item => {
        if (item.type === 'quiz-item') {
          const size = isMobile ? 100 : 140
          const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.9
          const isCorrect = item.color === '#00ff00'
          
          // Intense glow effect
          ctx.shadowBlur = (isMobile ? 35 : 45) * pulse
          ctx.shadowColor = isCorrect ? '#00ff00' : '#ff0000'
          
          // Card background - VIBRANT bright green/red (matching mockup)
          ctx.fillStyle = isCorrect ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'
          ctx.fillRect(item.x - size / 2, item.y - size / 2, size, size)
          
          // Inner darker layer for depth
          ctx.fillStyle = isCorrect ? 'rgba(0, 150, 0, 0.5)' : 'rgba(150, 0, 0, 0.5)'
          ctx.fillRect(item.x - size / 2 + 4, item.y - size / 2 + 4, size - 8, size - 8)
          
          // Card border with intense glow
          ctx.strokeStyle = isCorrect ? '#00ff00' : '#ff0000'
          ctx.lineWidth = isMobile ? 4 : 5
          ctx.strokeRect(item.x - size / 2, item.y - size / 2, size, size)
          
          ctx.shadowBlur = 0
          
          // Point indicator at TOP (header area)
          ctx.font = `bold ${isMobile ? 20 : 28}px monospace`
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.shadowBlur = 5
          ctx.shadowColor = '#000000'
          const pointText = isCorrect ? `+${quizData.pointsForCorrect}` : `${quizData.pointsForIncorrect}`
          ctx.fillText(pointText, item.x, item.y - size / 2 + (isMobile ? 26 : 32))
          
          // Password text in header (first instance)
          ctx.font = `bold ${isMobile ? 11 : 14}px monospace`
          const rawName = item.sentBy.name
          const passwordText = rawName.replace(/[^\x20-\x7E]/g, '')
          ctx.fillStyle = '#ffffff'
          ctx.fillText(passwordText, item.x, item.y - size / 2 + (isMobile ? 44 : 52))
          
          // Visual indicator emoji (checkmark or X) in CENTER
          ctx.font = `${isMobile ? 28 : 36}px sans-serif`
          ctx.fillStyle = isCorrect ? '#00ff00' : '#ff0000'
          ctx.shadowBlur = 8
          ctx.shadowColor = isCorrect ? '#00ff00' : '#ff0000'
          ctx.fillText(isCorrect ? '✔' : '❌', item.x, item.y + (isMobile ? 2 : 5))
          ctx.shadowBlur = 0
          
          // Password text AGAIN in middle (second instance - like mockup)
          ctx.font = `bold ${isMobile ? 10 : 13}px monospace`
          ctx.fillStyle = '#ffffff'
          ctx.shadowBlur = 4
          ctx.shadowColor = '#000000'
          ctx.fillText(passwordText, item.x, item.y + (isMobile ? 22 : 28))
          
          // Character count badge at BOTTOM
          const charCount = rawName.length
          ctx.font = `bold ${isMobile ? 9 : 11}px monospace`
          ctx.fillStyle = '#cccccc'
          ctx.fillText(`${charCount} characters`, item.x, item.y + size / 2 - (isMobile ? 10 : 12))
          
          ctx.shadowBlur = 0
          ctx.textAlign = 'left'
        }
      })
    }
// Draw animated cyber background with color progression
    function drawBackground() {
      // Primary background: use the same cosmic image used in the UI mockups.
      if (images.background.complete && images.background.naturalWidth > 0) {
        const img = images.background
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
        const drawWidth = img.naturalWidth * scale
        const drawHeight = img.naturalHeight * scale
        const drawX = (canvas.width - drawWidth) / 2
        const drawY = (canvas.height - drawHeight) / 2

        ctx.save()
        ctx.filter = 'saturate(0.82) brightness(0.88)'
        ctx.globalAlpha = 0.86
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        ctx.restore()

        const vignette = ctx.createRadialGradient(
          canvas.width / 2, canvas.height * 0.42, 0,
          canvas.width / 2, canvas.height * 0.42, canvas.width * 0.75
        )
        vignette.addColorStop(0, 'rgba(0,0,0,0.04)')
        vignette.addColorStop(1, 'rgba(2,4,10,0.46)')
        ctx.fillStyle = vignette
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Slightly deepen the green horizon tone without over-brightening.
        const horizonGlow = ctx.createRadialGradient(
          canvas.width / 2, canvas.height * 0.62, 0,
          canvas.width / 2, canvas.height * 0.62, canvas.width * 0.5
        )
        horizonGlow.addColorStop(0, 'rgba(36, 180, 130, 0.16)')
        horizonGlow.addColorStop(1, 'rgba(10, 40, 30, 0)')
        ctx.fillStyle = horizonGlow
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        // Fallback if image has not loaded yet.
        if (!cachedGradient || cachedGradientWidth !== canvas.width || cachedGradientHeight !== canvas.height) {
          cachedGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width
          )
          cachedGradient.addColorStop(0, '#0b1020')
          cachedGradient.addColorStop(1, '#02030a')
          cachedGradientWidth = canvas.width
          cachedGradientHeight = canvas.height
        }
        ctx.fillStyle = cachedGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Subtle stars layer over the background.
      // Use rectangles instead of arcs for better Chrome performance
      ctx.fillStyle = '#ffffff'
      const now = Date.now()
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        particle.y += particle.speed * frameScale
        if (particle.y > canvas.height) {
          particle.y = 0
          particle.x = Math.random() * canvas.width
        }
        
        // Simple stars - white only, subtle twinkle
        const twinkle = performanceMode
          ? 0.6
          : Math.sin(now / 800 + particle.x) * 0.3 + 0.7
        ctx.globalAlpha = twinkle * 0.42
        // Use rect instead of arc for Chrome performance (3x faster)
        const size = particle.size * 0.8
        ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size)
      }
      
      ctx.globalAlpha = 1.0
      
      // Update offset for animation
      bgOffset += effectiveObstacleSpeed * frameScale
      if (bgOffset > 50) bgOffset = 0
}
    
    let lastGameFrameTs = 0
    let gameFrameCount = 0
    let frameScale = 1
    // Game loop
    function gameLoop(timestamp: number) {
      if (!ctx) return
      const loopStart = performance.now()
      const gameDelta = lastGameFrameTs ? timestamp - lastGameFrameTs : 0
      lastGameFrameTs = timestamp
      gameFrameCount += 1
      const frameMs = gameDelta || 16.67
      frameScale = Math.min(frameMs / 16.67, 10)
// Apply slow-motion effect during quiz (only after countdown finishes)
      const slowMotionMultiplier = (quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0) ? 0.15 : 1.0
      
      // Levels 1-4: Keep all speed factors constant (difficulty from directions only)
      if (currentLevel <= 4) {
        speedFactor = 0.55 // Base player speed factor
        threatSpeedFactor = 0.38 // Base threat speed factor
        spawnFactor = 1.1 // Base spawn factor
      } else {
        // After level 4: Resume progressive scaling
        speedFactor = Math.min(1.6, Math.max(0.55, 0.55 + (currentLevel - 1) * 0.08))
        threatSpeedFactor = Math.min(1.4, Math.max(0.38, 0.38 + (currentLevel - 1) * 0.07))
        spawnFactor = Math.min(1.6, Math.max(1.1, 1.1 + (currentLevel - 1) * 0.05))
      }
      effectiveObstacleSpeed = obstacleSpeed * threatSpeedFactor
      effectivePlayerSpeed = playerSpeed * speedFactor
      effectiveSpawnFrequency = spawnFrequency / spawnFactor
      if (isHealing) {
        drawTutorialOverlay()
        if (!isGameOver) {
          animationId = requestAnimationFrame(gameLoop)
        }
        return
      }
      // Draw animated background
      const bgStart = performance.now()
      drawBackground()
      const bgEnd = performance.now()
      
      
      // Render quiz UI overlay if active
      if (quiz.refs.activeRef.current && quiz.refs.currentQuizRef.current) {
        renderQuizOverlay()
      }
      
      // Draw confetti particles (on top of everything)
      drawConfetti()
      
      // Check quiz completion
      if (quiz.refs.activeRef.current) {
        checkQuizCompletion()
      }
      
      // Handle player movement (WASD) - frozen during healing OR restoration
      if (!isHealing && !isRestoring) {
        if (keys['w'] || keys['W'] || keys['ArrowUp']) {
          playerY -= effectivePlayerSpeed * frameScale
        }
        if (keys['s'] || keys['S'] || keys['ArrowDown']) {
          playerY += effectivePlayerSpeed * frameScale
        }
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
          playerX -= effectivePlayerSpeed * frameScale
        }
        if (keys['d'] || keys['D'] || keys['ArrowRight']) {
          playerX += effectivePlayerSpeed * frameScale
        }
      }
      
      // Keep player in bounds
      playerX = Math.max(playerSize, Math.min(canvas.width - playerSize, playerX))
      playerY = Math.max(playerSize, Math.min(canvas.height - playerSize, playerY))
      
      // ===== ANIMATION ENHANCEMENTS =====
      
      // 1. Calculate if player is moving
      const deltaX = playerX - previousPlayerX
      const deltaY = playerY - previousPlayerY
      const isMoving = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1
      
      // 2. Update tilt based on horizontal movement direction
      const targetTilt = deltaX > 0 ? 10 : deltaX < 0 ? -10 : 0 // Lean into movement
      playerTilt += (targetTilt - playerTilt) * 0.2 // Smooth interpolation
      
      // 3. Speed up animation when actually moving
      const animationSpeed = isMoving ? 0.25 : 0.1 // Faster limb swing when moving
      
      // 4. Update celebration timer
      if (celebrationTimer > 0) {
        celebrationTimer -= frameMs // Decrease by frame time
      }
      
      // 5. Update victory dance timer
      if (victoryDanceTimer > 0) {
        victoryDanceTimer -= frameMs
        if (victoryDanceTimer <= 0) {
          isVictoryDancing = false
        }
      }
      
      // 6. Update confetti particles
      updateConfetti(frameMs)
      
      // Update previous position for next frame
      previousPlayerX = playerX
      previousPlayerY = playerY
      
      // Draw overlays
      drawTutorialOverlay()
      drawLevelUpOverlay()
      drawSectorChangeOverlay()
      drawRestorationOverlay()
      drawQuizCompletionMessage()
      
      // Update sector change timer
      if (showingSectorChange && sectorChangeTimer > 0) {
        sectorChangeTimer -= 16
        if (sectorChangeTimer <= 0) {
          showingSectorChange = false
        }
      }
      
      // Update restoration timer
      if (isRestoring && restorationTimer > 0) {
        restorationTimer -= 16
        if (restorationTimer <= 0) {
          isRestoring = false
        }
      }
      
      // Draw compact HUD matching reference screenshot
      const isReactQuizOpen = showQuizOverlayRef.current
      // Hide legacy canvas HUD for the full quiz/recovery lifecycle.
      const isInGameQuizOverlayActive = quiz.refs.activeRef.current
      const shouldHideHud = isReactQuizOpen || isInGameQuizOverlayActive || showingTutorial

      if (!shouldHideHud) {
        const hudX = 18
        const hudY = 18
        const hudWidth = canvas.width < 768 ? 238 : 270
        const hudHeight = canvas.width < 768 ? 40 : 44

        ctx.fillStyle = 'rgba(3, 10, 20, 0.86)'
        ctx.beginPath()
        ctx.roundRect(hudX, hudY, hudWidth, hudHeight, 10)
        ctx.fill()

        ctx.strokeStyle = 'rgba(50, 245, 255, 0.9)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.font = `20px ${EMOJI_FONT_STACK}`
        ctx.fillStyle = '#ffb648'
        ctx.textAlign = 'left'
        ctx.fillText('🧰', hudX + 10, hudY + 28)

        ctx.font = canvas.width < 768 ? 'bold 19px monospace' : 'bold 22px monospace'
        ctx.fillStyle = '#d8f8ff'
        ctx.fillText(`L${currentLevel} • SCORE:`, hudX + 42, hudY + (canvas.width < 768 ? 26 : 29))

        ctx.font = canvas.width < 768 ? 'bold 21px monospace' : 'bold 24px monospace'
        ctx.fillStyle = '#6ee7ff'
        const scoreTextX = hudX + hudWidth - 16
        ctx.textAlign = 'right'
        ctx.fillText(`${localScore}`, scoreTextX, hudY + (canvas.width < 768 ? 27 : 30))
        ctx.textAlign = 'left'
      }
      
      // Draw Current Threat panel (top-right) - desktop only
      if (canvas.width >= 768 && obstacles.length > 0 && !shouldHideHud) {
        const activeThreats = obstacles.filter(o => o.active && o.sentBy)
        if (activeThreats.length > 0) {
          // Get the closest threat to player
          const closestThreat = activeThreats.reduce((closest, current) => {
            const currentDist = Math.hypot(current.x - playerX, current.y - playerY)
            const closestDist = Math.hypot(closest.x - playerX, closest.y - playerY)
            return currentDist < closestDist ? current : closest
          })
          
          // Get unique threat categories currently active
          const categoryEmojis: {[key: string]: string} = {
            'password': '🔐',
            'phishing': '📧',
            'updates': '💥',
            'privacy': '🕵️',
            'wifi': '📡',
            'authentication': '🔑',
            'data-loss': '💾',
            'social-engineering': '🎭'
          }
          
          const uniqueCategories = [...new Set(activeThreats.map(t => t.category))]
          const leadCategory = uniqueCategories[0] || 'password'
          const threatIcons = [
            closestThreat.sentBy?.emoji || '🕵️',
            '⚠️',
            categoryEmojis[leadCategory] || '🔐',
          ]
          
          const panelWidth = 258
          const panelHeight = 128
          const panelX = canvas.width - panelWidth - 20
          const panelY = 16
          const cornerRadius = 12
          
          // Background
          ctx.fillStyle = 'rgba(10, 7, 8, 0.88)'
          ctx.beginPath()
          ctx.roundRect(panelX, panelY, panelWidth, panelHeight, cornerRadius)
          ctx.fill()
          
          ctx.strokeStyle = '#ff6a3d'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Header
          ctx.font = 'bold 14px monospace'
          ctx.fillStyle = '#ff9e6b'
          ctx.textAlign = 'center'
          ctx.fillText('CURRENT THREAT', panelX + panelWidth / 2, panelY + 22)
          
          // Threat icons in a row
          ctx.font = `32px ${EMOJI_FONT_STACK}`
          ctx.fillStyle = '#ffffff'
          const iconSpacing = 64
          const startX = panelX + (panelWidth - (threatIcons.length - 1) * iconSpacing) / 2
          threatIcons.forEach((icon, i) => {
            ctx.fillText(icon, startX + i * iconSpacing, panelY + 64)
          })
          
          // Attacker name
          ctx.font = 'bold 16px monospace'
          ctx.fillStyle = '#ffffff'
          const attackerName = closestThreat.sentBy?.name || 'UNKNOWN'
          const maxNameLength = 22
          const displayName = attackerName.length > maxNameLength 
            ? attackerName.substring(0, maxNameLength) + '...' 
            : attackerName
          ctx.fillText(displayName, panelX + panelWidth / 2, panelY + 94)
          
          // Status
          ctx.font = 'bold 14px monospace'
          const distance = Math.floor(Math.hypot(closestThreat.x - playerX, closestThreat.y - playerY))
          const status = distance < 100 ? 'CRITICAL' : distance < 200 ? 'NEAR' : 'SAFE'
          const statusColor = distance < 100 ? '#ff5a4a' : distance < 200 ? '#ff7f66' : '#ffb480'
          ctx.fillStyle = statusColor
          ctx.fillText(status, panelX + panelWidth / 2, panelY + 112)

          // Segmented danger bar
          const segments = 7
          const barWidth = panelWidth - 26
          const segmentGap = 3
          const segmentWidth = (barWidth - (segments - 1) * segmentGap) / segments
          const barX = panelX + 13
          const barY = panelY + panelHeight - 16
          const fillCount = distance < 100 ? 7 : distance < 200 ? 5 : 3

          for (let i = 0; i < segments; i++) {
            ctx.fillStyle = i < fillCount ? '#ff6e4b' : 'rgba(255,120,90,0.2)'
            ctx.fillRect(barX + i * (segmentWidth + segmentGap), barY, segmentWidth, 6)
          }
          
          ctx.textAlign = 'left'
        }
      }
      
      // REMOVED: Bottom-right quiz panel - info now in top banner (cleaner design)
      
      // Spawn obstacles and kits (pause during healing)
      if (!isHealing) {
        if (timestamp - lastSpawn > effectiveSpawnFrequency) {
          spawnObstacle()
          lastSpawn = timestamp
        }
        
        // Spawn kits periodically using a timer so low FPS won't skip
        kitSpawnTimer += frameMs
        if (kitSpawnTimer >= KIT_SPAWN_INTERVAL) {
          spawnKit()
          kitSpawnTimer -= KIT_SPAWN_INTERVAL
        }
      }
      
      // Update game time
      gameTime += frameMs // Approximately 16ms per frame at 60fps
      
      // Update and draw obstacles (apply slow-motion during quiz)
obstacles = obstacles.filter(obstacle => {
if (!isHealing) {
          obstacle.y += obstacle.vy * slowMotionMultiplier * frameScale
          obstacle.x += obstacle.vx * slowMotionMultiplier * frameScale
        }
        
        
        // Culling: only draw if visible on screen
        const isVisible = obstacle.y > -100 && obstacle.y < canvas.height + 100
        
        // Skip drawing obstacles during quiz mode (clean focus like mockup)
        const isQuizActive = quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0
        
        if (isVisible && !isQuizActive) {
// CLEAN: Removed shadow effects for better performance and clarity
          ctx.shadowBlur = 0
          
          // Draw sprite if available, otherwise fallback to colored square
          const sprite = threatToSprite[obstacle.threatId] || categoryToSprite[obstacle.category as ThreatCategory]
          if (sprite && sprite.complete) {
            ctx.drawImage(
              sprite,
              Math.floor(obstacle.x - obstacle.width / 2),
              Math.floor(obstacle.y - obstacle.height / 2),
              obstacle.width,
              obstacle.height
            )
          } else {
            // Fallback to colored square
            ctx.fillStyle = obstacle.color
            ctx.fillRect(
              obstacle.x - obstacle.width / 2,
              obstacle.y - obstacle.height / 2,
              obstacle.width,
              obstacle.height
            )
          }
          ctx.shadowBlur = 0
}
        
        // Show ghost player name for first 2 seconds (2000ms) - HIDDEN DURING QUIZ
        // OPTIMIZED: Uses cached RGB values (no parseInt on every frame)
        // DISABLED ON CHROME: Text rendering is too slow, causes 2-5 FPS at high levels
        const timeSinceSpawn = gameTime - (obstacle.spawnTime || 0)
        if (!performanceMode && timeSinceSpawn < 2000 && obstacle.sentBy && !isQuizActive) {
const opacity = 1 - (timeSinceSpawn / 2000) // Fade out
          
          // Color based on level (low=gray, mid=cyan, high=yellow, elite=red)
          let nameColor = '#ffffff'
          let fontSize = 12
          let prefix = ''
          
          if (obstacle.sentBy.level >= 100) {
            nameColor = '#ff0000' // Elite - Red
            fontSize = 13
            prefix = '⭐'
          } else if (obstacle.sentBy.level >= 71) {
            nameColor = '#ffff00' // High - Yellow
            fontSize = 12
            prefix = '◆'
          } else if (obstacle.sentBy.level >= 31) {
            nameColor = '#00ffff' // Mid - Cyan
            fontSize = 12
          } else {
            nameColor = '#aaaaaa' // Low - Gray
            fontSize = 11
          }
          
          // Use cached RGB conversion (parsed once per color, not every frame)
          const rgb = hexToRgb(nameColor)
          
          // Chrome optimization: Use simple font and no shadows (ctx.fillText is 100x slower with shadows!)
          ctx.font = performanceMode ? `bold ${fontSize}px monospace` : `bold ${fontSize}px ${EMOJI_FONT_STACK}`
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
          ctx.textAlign = 'center'
          ctx.shadowBlur = 0  // CRITICAL: shadowBlur makes fillText 100x slower in Chrome
          ctx.shadowColor = 'transparent'
          
          // Draw name with level (and emoji if available)
          const displayName = obstacle.sentBy.emoji 
            ? `${obstacle.sentBy.emoji} ${prefix}${obstacle.sentBy.name} [${obstacle.sentBy.level}]`
            : `${prefix}${obstacle.sentBy.name} [${obstacle.sentBy.level}]`
          
          ctx.fillText(
            displayName,
            obstacle.x,
            obstacle.y - obstacle.height / 2 - 10
          )
          
          ctx.shadowBlur = 0
          ctx.textAlign = 'left'
}
// Check collision with obstacles (skip if player is invincible)
        const isPlayerInvincible = quiz.refs.activeRef.current || isHealing || isRestoring || levelUpTimer > 0
        if (!isPlayerInvincible && checkCollision(
          { x: playerX - playerSize / 2, y: playerY - playerSize / 2, width: playerSize, height: playerSize },
          { x: obstacle.x - obstacle.width / 2, y: obstacle.y - obstacle.height / 2, width: obstacle.width, height: obstacle.height }
        )) {
          // Determine required kit based on threat ID
          const requiredKit = getRequiredKit(obstacle.threatId)
          
          // Check if player has the required kit
          if (requiredKit && kitInventory[requiredKit] !== undefined && kitInventory[requiredKit] > 0) {
            // Use the kit - player survives but needs to recollect!
            kitInventory[requiredKit]--
            totalKitsCollected = Math.max(0, totalKitsCollected - 1) // Deduct from progress - must recollect to advance
            lastHitThreatId = obstacle.threatId
            setLastAttacker(obstacle.sentBy, obstacle.threatId)
            showTutorial(requiredKit, obstacle.threatId)
            localScore -= 25 // Cost for consuming kit
            returnObstacleToPool(obstacle)
            return false
          } else {
            // No required kit - check for BACKUP KIT (extra life!)
            if (kitInventory['backup-system'] !== undefined && kitInventory['backup-system'] > 0) {
              // USE BACKUP KIT - RESTORE FROM BACKUP! 💾
              kitInventory['backup-system']--
              totalKitsCollected = Math.max(0, totalKitsCollected - 1)
              
              // Trigger restoration animation
              isRestoring = true
              restorationTimer = RESTORATION_DURATION
              
              // Clear all threats during restoration (fresh start)
              obstacles.forEach(obs => returnObstacleToPool(obs))
              obstacles = []
              
              // Bonus score for survival via backup
              localScore -= 100 // Cost for consuming backup kit
              
              // Remove the threat
              returnObstacleToPool(obstacle)
              return false
            } else {
              // No kit AND no backup - game over
              // Sync local score to Zustand store
              setScore(localScore)
              
              // Save game state for quiz continuation option
              setSavedGameState({
                level: currentLevel,
                kits: { ...kitInventory },
                score: localScore
              })
              lastHitThreatId = obstacle.threatId
              setLastAttacker(obstacle.sentBy, obstacle.threatId)
              trackGameOver(currentLevel, localScore, obstacle.threatId)
              setGameOver(true)
              setRunning(false)
              // Track first death for tutorial tooltip
              if (isFirstDeath) {
                setIsFirstDeath(false)
              }
              return false
            }
          }
        }
        
        // Remove obstacles that are off screen from any direction and return to pool
        const isOffScreen = 
          obstacle.y > canvas.height + 100 || // Below screen
          obstacle.y < -100 || // Above screen
          obstacle.x > canvas.width + 100 || // Right of screen
          obstacle.x < -100 // Left of screen
        
        if (isOffScreen) {
          returnObstacleToPool(obstacle)
          return false
        }
        
        return true
      })
// Update and draw kits (protection kits)
powerups = powerups.filter(kit => {
        // Skip drawing non-quiz items during quiz mode (reduce clutter)
        const isQuizActive = quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0
        const isQuizItem = kit.type === 'quiz-item'
        
        if (isQuizActive && !isQuizItem) {
          // Hide regular powerups during quiz but keep them in array
          return true
        }
        
        // Calculate size for both quiz items and regular kits (needed for collision detection)
        const pulse = Math.sin(timestamp * 0.005) * 0.3 + 0.7
        const size = isQuizItem ? 120 : (35 * pulse) // Quiz items are larger
        
        // Skip rendering quiz items here - they're rendered in renderQuizOverlay()
        if (isQuizItem) {
          // Don't draw quiz items in powerups loop (already drawn in quiz overlay)
          // But still need to check collision below, so continue to that logic
        } else {
          // Draw regular kit with pulsing glow
          
          ctx.shadowBlur = performanceMode ? 0 : 30 * pulse
          ctx.shadowColor = kit.color
          
          // Kit icon based on type
          let icon = '🔐'
          if (kit.type.startsWith('kit-')) {
            const kitId = kit.type.replace('kit-', '')
            icon = getKitIcon(kitId)
          }
          
          // Draw kit box
          ctx.fillStyle = kit.color + '88'
          ctx.fillRect(kit.x - size / 2, kit.y - size / 2, size, size)
          
          ctx.strokeStyle = kit.color
          ctx.lineWidth = 3
          ctx.strokeRect(kit.x - size / 2, kit.y - size / 2, size, size)
          
          // Draw icon
          ctx.font = `bold 24px ${EMOJI_FONT_STACK}`
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.fillText(icon, kit.x, kit.y + 8)
          ctx.textAlign = 'left'
          
          ctx.shadowBlur = 0
        }
        
        // Skip collection while healing to keep tutorial focus
        if (isHealing) {
          return true
        }
        
        // Check collision
        if (checkCollision(
          { x: playerX - playerSize / 2, y: playerY - playerSize / 2, width: playerSize, height: playerSize },
          { x: kit.x - size / 2, y: kit.y - size / 2, width: size, height: size }
        )) {
          // Handle quiz item collection
          if (kit.type === 'quiz-item' && quiz.refs.activeRef.current && quiz.refs.currentQuizRef.current) {
            const itemId = kit.threatId
            
            // Check if this was correct or incorrect
            const isCorrect = quiz.refs.currentQuizRef.current.correctAnswers.includes(itemId)
            
            // Update via quiz action
            quiz.actions.collectItem(itemId, isCorrect)
            
            if (isCorrect) {
              localScore += 100
              
              // Green flash for correct
              ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              
              // Spawn confetti at collection point
              const isMobile = canvas.width < 768
              spawnConfetti(kit.x + kit.width / 2, kit.y + kit.height / 2, isMobile ? 8 : 12)
              
              // Start victory dance
              isVictoryDancing = true
              victoryDanceTimer = VICTORY_DANCE_DURATION
            } else {
              // Red flash for incorrect
              ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            
            // Remove this quiz item
            return false
          }
          
          // Normal kit collection
          const kitType = kit.type.replace('kit-', '') as keyof typeof kitInventory
          
          // Add to inventory if not full
          if (kitType && kitInventory[kitType] !== undefined && kitInventory[kitType] < MAX_KIT_CAPACITY) {
            kitInventory[kitType]++
            totalKitsCollected++
            localScore += 50
            trackKitCollected(kitType, totalKitsCollected)
            
            // ⭐ TRIGGER CELEBRATION ANIMATION! ⭐
            celebrationTimer = CELEBRATION_DURATION
            
            // Check if player should level up
            const kitsForNextLevel = calculateKitsNeededForNextLevel(currentLevel)
            if (totalKitsCollected >= kitsForNextLevel) {
              advanceLevel()
            }
            
            // Show collection feedback with particle burst!
            ctx.font = 'bold 20px monospace'
            ctx.fillStyle = '#00ff00'
            ctx.textAlign = 'center'
            ctx.fillText(`+1 ${kitType.toUpperCase()} KIT!`, kit.x, kit.y - 40)
            
            // Celebration particles burst
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2
              const speed = 3 + Math.random() * 2
              const particleX = kit.x + Math.cos(angle) * 30
              const particleY = kit.y + Math.sin(angle) * 30
              
              ctx.fillStyle = kit.color
              ctx.beginPath()
              ctx.arc(particleX, particleY, 4, 0, Math.PI * 2)
              ctx.fill()
            }
            
            // Celebration ring
            ctx.strokeStyle = kit.color
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(kit.x, kit.y, 40, 0, Math.PI * 2)
            ctx.stroke()
            
            ctx.textAlign = 'left'
          }
          
          return false
        }
        
        return true
      })
// No boss mode anymore - continuous gameplay!
      
      // Draw player LAST so it's always visible on top of everything
      // Dynamic glow based on kits collected or quiz state
      const totalKitsInInventory = calculateTotalKits(kitInventory)
      const glowIntensity = 20 + (totalKitsInInventory * 10) + (totalKitsCollected * 2)
      const glowSize = 30 + (totalKitsInInventory * 5)
      
      // Color changes based on rank OR quiz state
      let glowColor = '#00ffff' // Newbie - cyan
      
      // During quiz, use golden glow to match INVINCIBLE status
      if (quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0) {
        glowColor = '#ffd700' // Gold for invincibility
      } else {
        const currentRank = getRank()
        if (currentRank === 'Analyst') {
          glowColor = '#00ff00' // Green
        } else if (currentRank === 'Expert') {
          glowColor = '#ffaa00' // Orange
        } else if (currentRank === 'Commando') {
          glowColor = '#ffd700' // Gold
        }
      }
      
      // Multi-layered glow effect
      ctx.shadowBlur = performanceMode ? 0 : (quiz.refs.activeRef.current ? 40 : glowSize)
      ctx.shadowColor = glowColor
      
      // Add pulsing effect for higher ranks
      if (totalKitsCollected > 10) {
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7
        ctx.globalAlpha = 0.3
        ctx.fillStyle = glowColor
        ctx.beginPath()
        ctx.arc(playerX, playerY, playerSize * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      
      // Healing visual effect - shield around player
      if (isHealing) {
        const healPulse = Math.sin(Date.now() / 150) * 0.4 + 0.6
        
        // Rotating shield rings
        const rotation = (Date.now() / 30) % 360
        ctx.save()
        ctx.translate(playerX, playerY)
        ctx.rotate((rotation * Math.PI) / 180)
        
        // Outer ring
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 * healPulse})`
        ctx.lineWidth = 4
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ffff'
        ctx.beginPath()
        ctx.arc(0, 0, playerSize * 1.5, 0, Math.PI * 2)
        ctx.stroke()
        
        // Inner ring (counter-rotating)
        ctx.rotate(-((rotation * 2 * Math.PI) / 180))
        ctx.strokeStyle = `rgba(0, 255, 100, ${0.5 * healPulse})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, playerSize * 1.2, 0, Math.PI * 2)
        ctx.stroke()
        
        ctx.restore()
        ctx.shadowBlur = 0
        
        // Cross symbol above player
        ctx.font = 'bold 24px monospace'
        ctx.fillStyle = `rgba(0, 255, 0, ${healPulse})`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 10
        ctx.shadowColor = '#00ff00'
        ctx.fillText('+', playerX, playerY - playerSize - 10)
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
      }
      
      // Backup restoration effect - blue digital rain around player
      if (isRestoring) {
        const restorePulse = Math.sin(Date.now() / 100) * 0.4 + 0.6
        
        // Expanding blue circles (data being restored)
        for (let i = 0; i < 3; i++) {
          const radius = playerSize * (1 + i * 0.5) * restorePulse
          ctx.strokeStyle = `rgba(0, 200, 255, ${0.8 - i * 0.25})`
          ctx.lineWidth = 3
          ctx.shadowBlur = 20
          ctx.shadowColor = '#00ccff'
          ctx.beginPath()
          ctx.arc(playerX, playerY, radius, 0, Math.PI * 2)
          ctx.stroke()
        }
        
        ctx.shadowBlur = 0
        
        // Disk icon above player (rotating)
        const diskRotation = (Date.now() / 50) % 360
        ctx.save()
        ctx.translate(playerX, playerY - playerSize - 30)
        ctx.rotate((diskRotation * Math.PI) / 180)
        ctx.font = 'bold 32px monospace'
        ctx.fillStyle = `rgba(0, 200, 255, ${restorePulse})`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ccff'
        ctx.fillText('💾', 0, 0)
        ctx.restore()
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
      }
      
      // Quiz invincibility shield - protective barrier during quiz
      if (quiz.refs.activeRef.current) {
        const shieldPulse = Math.sin(Date.now() / 200) * 0.3 + 0.7
        const rotation = (Date.now() / 40) % 360
        
        // Outer rotating shield ring (cyan)
        ctx.save()
        ctx.translate(playerX, playerY)
        ctx.rotate((rotation * Math.PI) / 180)
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.7 * shieldPulse})`
        ctx.lineWidth = 5
        ctx.shadowBlur = 25
        ctx.shadowColor = '#00ffff'
        ctx.beginPath()
        ctx.arc(0, 0, playerSize * 1.6, 0, Math.PI * 2)
        ctx.stroke()
        
        // Inner hexagon pattern (counter-rotating)
        ctx.rotate(-((rotation * 1.5 * Math.PI) / 180))
        const hexagonPoints = 6
        const hexRadius = playerSize * 1.3
        ctx.strokeStyle = `rgba(0, 200, 255, ${0.6 * shieldPulse})`
        ctx.lineWidth = 3
        ctx.beginPath()
        for (let i = 0; i <= hexagonPoints; i++) {
          const angle = (i * 2 * Math.PI) / hexagonPoints
          const x = hexRadius * Math.cos(angle)
          const y = hexRadius * Math.sin(angle)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        
        ctx.restore()
        
        // "INVINCIBLE" text above player (prominent, matching mockup)
        ctx.font = 'bold 16px monospace'
        ctx.fillStyle = `rgba(0, 255, 255, ${shieldPulse})`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ffff'
        ctx.fillText('INVINCIBLE', playerX, playerY - playerSize - 50)
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
      }
      
      // Draw animated stick figure with moving limbs
      ctx.shadowBlur = 0
      
      // Update animation time (speed up when moving!)
      animationTime += animationSpeed * frameScale
      
      // Calculate limb angles (swinging back and forth)
      // If celebrating, arms go up! Otherwise normal swing
      let legSwing = Math.sin(animationTime) * 25 // Degrees
      let armSwing = celebrationTimer > 0 ? -90 : Math.sin(animationTime) * 20 // Arms up when celebrating!
      
      // Character dimensions
      const headRadius = playerSize * 0.25
      const bodyHeight = playerSize * 0.4
      const limbLength = playerSize * 0.3
      const limbWidth = playerSize * 0.12
      
      // Victory dance animation
      let danceJump = 0
      let danceArmAngle = armSwing
      if (isVictoryDancing) {
        // Bouncing motion
        const bounceProgress = (VICTORY_DANCE_DURATION - victoryDanceTimer) / VICTORY_DANCE_DURATION
        const bounceSpeed = 8 // Faster bounce
        danceJump = Math.abs(Math.sin(bounceProgress * Math.PI * bounceSpeed)) * 15
        
        // Exaggerated arm waving
        danceArmAngle = Math.sin(bounceProgress * Math.PI * bounceSpeed * 2) * 60
      }
      
      // Draw character from center point with tilt
      ctx.save()
      ctx.translate(playerX, playerY - danceJump) // Apply jump offset
      ctx.rotate((playerTilt * Math.PI) / 180) // Tilt character when moving left/right
      
      // HEAD
      ctx.fillStyle = glowColor
      ctx.beginPath()
      ctx.arc(0, -bodyHeight / 2 - headRadius, headRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Eyes (simple dots or happy eyes during victory dance)
      ctx.fillStyle = '#000000'
      ctx.lineWidth = 2
      if (isVictoryDancing) {
        // Happy eyes (^_^)
        ctx.beginPath()
        ctx.arc(-headRadius * 0.35, -bodyHeight / 2 - headRadius - 2, headRadius * 0.25, 0, Math.PI, true)
        ctx.arc(headRadius * 0.35, -bodyHeight / 2 - headRadius - 2, headRadius * 0.25, 0, Math.PI, true)
        ctx.stroke()
        
        // Big smile
        ctx.beginPath()
        ctx.arc(0, -bodyHeight / 2 - headRadius + 3, headRadius * 0.4, 0.2, Math.PI - 0.2)
        ctx.stroke()
      } else {
        // Normal eyes (dots)
        ctx.beginPath()
        ctx.arc(-headRadius * 0.3, -bodyHeight / 2 - headRadius - 2, headRadius * 0.15, 0, Math.PI * 2)
        ctx.arc(headRadius * 0.3, -bodyHeight / 2 - headRadius - 2, headRadius * 0.15, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // BODY
      ctx.fillStyle = glowColor
      ctx.fillRect(-playerSize * 0.15, -bodyHeight / 2, playerSize * 0.3, bodyHeight)
      
      // LEFT LEG (swinging)
      ctx.save()
      ctx.translate(-playerSize * 0.1, bodyHeight / 2)
      ctx.rotate((legSwing * Math.PI) / 180)
      ctx.fillStyle = glowColor
      ctx.fillRect(-limbWidth / 2, 0, limbWidth, limbLength)
      ctx.restore()
      
      // RIGHT LEG (opposite swing)
      ctx.save()
      ctx.translate(playerSize * 0.1, bodyHeight / 2)
      ctx.rotate((-legSwing * Math.PI) / 180)
      ctx.fillStyle = glowColor
      ctx.fillRect(-limbWidth / 2, 0, limbWidth, limbLength)
      ctx.restore()
      
      // LEFT ARM (opposite of left leg, or dance wave)
      ctx.save()
      ctx.translate(-playerSize * 0.25, -bodyHeight * 0.3)
      ctx.rotate((isVictoryDancing ? -danceArmAngle : -armSwing) * Math.PI / 180)
      ctx.fillStyle = glowColor
      ctx.fillRect(-limbWidth / 2, 0, limbWidth, limbLength)
      ctx.restore()
      
      // RIGHT ARM (opposite of right leg, or dance wave)
      ctx.save()
      ctx.translate(playerSize * 0.25, -bodyHeight * 0.3)
      ctx.rotate((isVictoryDancing ? danceArmAngle : armSwing) * Math.PI / 180)
      ctx.fillStyle = glowColor
      ctx.fillRect(-limbWidth / 2, 0, limbWidth, limbLength)
      ctx.restore()
      
      ctx.restore()
      
      // Draw celebration effect above player
      if (celebrationTimer > 0) {
        const celebOpacity = celebrationTimer / CELEBRATION_DURATION
        const celebSize = 1 + (1 - celebOpacity) * 0.5 // Grow as it fades
        
        ctx.font = `bold ${Math.floor(30 * celebSize)}px monospace`
        ctx.fillStyle = `rgba(255, 215, 0, ${celebOpacity})`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 20
        ctx.shadowColor = '#ffd700'
        ctx.fillText('⭐', playerX, playerY - playerSize - 20 - (1 - celebOpacity) * 20)
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
      }
      
      // Update distance (based on kits collected)
      setDistance(totalKitsCollected * 10 + currentLevel * 50)
// Continue loop
      if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop)
      }
    }
    
    // Start game
    setRunning(true)
    animationId = requestAnimationFrame(gameLoop)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('resize', resizeCanvas)
      // Clean up touch listeners
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchcancel', handleTouchEnd)
      canvas.removeEventListener('click', handleCanvasClick)
      
      // Clean up UI timers
      ui.cleanup()
      // Clear all tracked game timeouts to prevent memory leaks
      timeoutRefs.current.forEach(tid => clearTimeout(tid))
      timeoutRefs.current = []
      
      // Clean up image references
      Object.values(images).forEach(img => {
        img.src = ''
      })
    }
  }, [gameStarted, isGameOver, setDistance, setScore, setGameOver, setRunning, setLastAttacker, resetGame, setLevel, ui.state.mobileHudExpanded, ui.state.desktopHudExpanded])

  const refreshLeaderboard = async () => {
    try {
      const entries = await getLeaderboard(50)
      const mapped: LeaderboardEntry[] = entries.map((entry, index) => ({
        id: `remote_${index}_${entry.createdAt}`,
        name: entry.username,
        score: entry.score,
        distance: entry.distance,
        createdAt: new Date(entry.createdAt).getTime()
      }))
      setLeaderboard(mapped.slice(0, 10)) // Sync top 10 to game store for display
    } catch {
    }
  }

  const renderAuthModal = () => {
    if (!showAuthModal) return null
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm bg-[#0b1020]/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_26px_rgba(0,200,255,0.2)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-cyan-200 font-mono text-sm sm:text-base font-bold tracking-wide">
              {authMode === 'signup' ? 'Create account' : 'Sign in'}
            </h3>
            <button
              onClick={() => setShowAuthModal(false)}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-colors"
              aria-label="Close auth"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-sm font-mono"
              placeholder="email@example.com"
              required
            />
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-sm font-mono"
              placeholder="password"
              required
              minLength={8}
            />
            {authError && (
              <p className="text-red-300 text-xs font-mono">{authError}</p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black py-2 rounded-full text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(80,200,255,0.5)] disabled:opacity-60"
            >
              {authLoading ? 'WORKING...' : authMode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>
          <div className="flex items-center justify-between mt-3 text-[11px] font-mono">
            <button
              onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              className="text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              {authMode === 'signup' ? 'Have an account? Sign in' : 'New here? Create account'}
            </button>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Continue without saving
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      const result = authMode === 'signup'
        ? await signUp(authEmail.trim(), authPassword)
        : await signIn(authEmail.trim(), authPassword)

      if (result.status !== 'OK') {
        const fieldError = result.formFields?.find((field) => field.error)?.error
        setAuthError(result.message || fieldError || 'Authentication failed.')
        setAuthLoading(false)
        return
      }

      const user = await getCurrentUser()

      setCurrentUser(user)
      setAuthStatus(user ? 'authed' : 'guest')
      setShowAuthModal(false)

      if (user && !user.username) {
        setUsernameInput('')
        setShowUsernameModal(true)
      } else if (user && pendingSave) {
        setPendingSave(false)
        await handleSaveToLeaderboard()
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUsernameLoading(true)
    setUsernameError(null)
    try {
      const updated = await apiSetUsername(usernameInput.trim())
      setCurrentUser(updated)
      setShowUsernameModal(false)
      setSaveMessage(null)
      if (pendingSave) {
        setPendingSave(false)
        await handleSaveToLeaderboard()
      }
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Failed to set username.')
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleSaveToLeaderboard = async () => {
    if (authStatus !== 'authed') {
      setPendingSave(true)
      setShowAuthModal(true)
      return
    }
    if (!currentUser?.username) {
      setPendingSave(true)
      setShowUsernameModal(true)
      return
    }

    setPendingSave(false)
    setSaveStatus('saving')
    setSaveMessage(null)
    try {
      const durationMs = runStartedAt ? Math.max(0, Date.now() - runStartedAt) : 0
      const result = await submitRun({
        score,
        distance,
        durationMs,
        clientVersion: 'web'
      })
      addLeaderboardEntry({
        name: currentUser.username,
        score,
        distance,
        isPlayer: true
      })
      await refreshLeaderboard()
      setSaveStatus('saved')
      
      // Show contest entry notification
      if (result.enteredContests && result.enteredContests.length > 0) {
        const contestNames = result.enteredContests.join(', ')
        setSaveMessage(`Saved to leaderboard! 🏆 Entered in: ${contestNames}`)
      } else {
        setSaveMessage('Saved to leaderboard.')
      }
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save score.')
    }
  }

  useEffect(() => {
    if (!isGameOver) return
    if (showQuiz) return
    if (authStatus !== 'authed') return
    if (!currentUser?.username) return
    if (saveStatus !== 'idle') return
    
    // Auto-save with slight delay to ensure state is stable
    const timer = setTimeout(() => {
      handleSaveToLeaderboard()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isGameOver, showQuiz, authStatus, currentUser?.username, saveStatus])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // Ignore sign-out errors to avoid blocking UI reset
    } finally {
      setCurrentUser(null)
      setAuthStatus('guest')
      setSaveStatus('idle')
      setSaveMessage(null)
      setPendingSave(false)
    }
  }

  const handleStart = () => {
    trackGameStart()
    resetGame()
    setGameStarted(true)
    setLevel(1)
    setRunStartedAt(Date.now())
    setSaveStatus('idle')
    setSaveMessage(null)
    setPendingSave(false)
  }
  
  const handleRestart = () => {
    resetGame()
    setSavedGameState(null)
    setShowQuiz(false)
    setGameStarted(true)
    setLevel(1)
    setRunStartedAt(Date.now())
    setSaveStatus('idle')
    setSaveMessage(null)
    setPendingSave(false)
  }
  
  const handleQuizPass = () => {
    // Track quiz pass
    if (lastThreatType) {
      const kit = getProtectionKitForThreat(lastThreatType)
      if (kit) trackQuizPass(kit.id)
    }
    // Continue from saved checkpoint!
    setShowQuiz(false)
    if (savedGameState) {
      // DIRECTLY restore level and score (don't rely on useEffect timing)
      setLevel(savedGameState.level)
      setScore(savedGameState.score)
      // Kits will be restored from savedGameState in game loop
    }
    setGameOver(false)
    setGameStarted(true)
    // Clear saved state after longer delay to ensure game loop reads kits
    const tid = setTimeout(() => setSavedGameState(null), 500)
    timeoutRefs.current.push(tid)
  }
  
  const handleQuizFail = () => {
    // Track quiz fail
    if (lastThreatType) {
      const kit = getProtectionKitForThreat(lastThreatType)
      if (kit) trackQuizFail(kit.id)
    }
    // Restart but keep 50% of kits (rounded down)
    setShowQuiz(false)
    
    if (savedGameState) {
      // Calculate 50% of each kit type
      const partialKits = ALL_KIT_TYPES.reduce((acc, kitId) => {
        acc[kitId] = Math.floor((savedGameState.kits[kitId] || 0) / 2)
        return acc
      }, {} as Record<string, number>)
      
      // Save partial kits for initialization
      setSavedGameState({
        level: 1,
        kits: partialKits,
        score: 0
      })
    }
    
    resetGame()
    setGameStarted(true)
    setLevel(1)
    setRunStartedAt(Date.now())
    setSaveStatus('idle')
    setSaveMessage(null)
    setPendingSave(false)
    // Clear saved state after game loop starts
    const tid = setTimeout(() => setSavedGameState(null), 100)
    timeoutRefs.current.push(tid)
  }
  
  // Show nothing during SSR to prevent hydration errors
  if (!isMounted) {
    return null
  }
  
  // Loading screen
  if (isLoading) {
    return <LoadingScreen progress={loadProgress} />
  }
  
  if (!gameStarted) {
    return (
      <>
        <style jsx>{`
          .start-screen-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: scroll;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
            scrollbar-width: none;
            touch-action: pan-y;
          }
          .start-screen-wrapper::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}</style>
        <div className="start-screen-wrapper">
          <TutorialOverlay 
            showing={tutorial.state.showing}
            onClose={tutorial.actions.close}
          />
          <StartScreenNew 
            onStart={handleStart}
            onShowTutorial={tutorial.actions.open}
            onSignIn={authStatus === 'authed' ? handleSignOut : () => setShowAuthModal(true)}
            signInLabel={authStatus === 'authed'
              ? `Signed in as ${currentUser?.username || 'Player'} • Sign out`
              : 'Guest • Sign in'
            }
            activeContests={activeContests}
          />
          {renderAuthModal()}
        </div>
      </>
    )
  }
  
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      {renderAuthModal()}
      {/* Top runs panel removed from active gameplay per design */}
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        tabIndex={0}
      />

      {/* Mobile Recovery Bottom Sheet */}
      {recoveryOverlay && (
        <div className="absolute inset-0 z-20 sm:hidden pointer-events-none">
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-x-0 bottom-0 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pointer-events-auto">
            <div
              className="mx-auto border-2 border-cyan-300/75 bg-[#061225]/95 text-white shadow-[0_0_26px_rgba(34,211,238,0.4)] overflow-y-auto"
              style={{
                width: 'min(92vw, 760px)',
                maxHeight: 'min(78vh, 680px)',
                padding: 'clamp(14px, 2.5vw, 22px)',
                borderRadius: 18,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="text-center text-cyan-100 text-[clamp(14px,3.2vw,18px)]">🛡️</div>
              <h3 className="text-cyan-200 font-black font-mono tracking-wide text-center" style={{ fontSize: 'clamp(18px, 3.8vw, 26px)' }}>
                Recovery in Progress
              </h3>
              <p
                className="mt-1 text-cyan-100/90 text-center font-semibold font-mono"
                style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}
              >
                You were hit by a privacy threat - protection activated.
              </p>
              <div className="mt-2 h-px w-full bg-cyan-200/20" />

              <div className="mt-3 grid grid-cols-2 gap-0 rounded-xl border border-cyan-200/20 bg-black/20 overflow-hidden">
                <div className="px-3 py-2 border-r border-cyan-200/15">
                  <p className="text-yellow-300 font-bold font-mono" style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}>
                    Threat:
                  </p>
                  <p className="mt-0.5 text-white font-bold font-mono" style={{ fontSize: 'clamp(13px, 2.9vw, 16px)', lineHeight: 1.35 }}>
                    {recoveryOverlay.threatName}
                  </p>
                  <p className="mt-2 text-cyan-100 font-bold font-mono" style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}>
                    What it stops:
                  </p>
                  <ul className="mt-1 space-y-0.5 text-white font-mono">
                    {recoveryOverlay.whatItStops.slice(0, 3).map((item, idx) => (
                      <li key={idx} style={{ fontSize: 'clamp(12px, 2.7vw, 14px)', lineHeight: 1.35 }}>
                        ✓ {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-3 py-2">
                  <p className="text-cyan-300 font-bold font-mono" style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}>
                    Protection Used:
                  </p>
                  <p className="mt-0.5 text-white font-bold font-mono" style={{ fontSize: 'clamp(13px, 2.9vw, 16px)', lineHeight: 1.35 }}>
                    {recoveryOverlay.protectionName}
                  </p>
                  <p className="mt-2 text-cyan-100 font-bold font-mono" style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}>
                    Real-world equivalents:
                  </p>
                  <button
                    onClick={() => setShowRecoveryDetails((prev) => !prev)}
                    className="mt-1 w-full rounded-md border border-cyan-200/20 bg-[#0a1a31]/85 px-2 py-1 text-left text-cyan-100 font-semibold font-mono flex items-center justify-between"
                    style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}
                  >
                    <span>{showRecoveryDetails ? 'Less' : 'More'}</span>
                    <span>{showRecoveryDetails ? '▴' : '▾'}</span>
                  </button>
                </div>
              </div>

              {showRecoveryDetails && (
                <div className="mt-3 rounded-xl border border-cyan-300/30 bg-black/25 px-3 py-3">
                  <p className="text-cyan-200 font-bold font-mono" style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}>
                    Real-world equivalents
                  </p>
                  <ul className="mt-2 space-y-1 text-white font-mono">
                    {recoveryOverlay.realWorldEquivalents.map((item, idx) => (
                      <li key={idx} style={{ fontSize: 'clamp(12px, 2.7vw, 14px)', lineHeight: 1.35 }}>
                        ✓ {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-cyan-100/90 font-mono" style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}>
                    Tip: {recoveryOverlay.tipText}
                  </p>
                </div>
              )}

              <p
                className="mt-3 text-center text-cyan-100 font-bold font-mono"
                style={{ fontSize: 'clamp(12px, 2.6vw, 14px)' }}
              >
                Recovery completes in {recoveryOverlay.timeLeft}s
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[15px]">🙂</span>
                <div className="h-3 flex-1 rounded-full border border-cyan-300/70 bg-[#0a1220] p-[2px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-150"
                    style={{ width: `${Math.max(0, Math.min(1, recoveryOverlay.progress)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {isGameOver && !showQuiz && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 p-3 md:p-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/space-background-final.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.84,
                filter: 'saturate(0.72) brightness(0.9)',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.08)_0%,rgba(2,4,10,0.42)_72%)]" />
          </div>

          <div className="relative z-10 w-full max-w-[680px] text-center">
            <div className="mb-4 rounded-2xl border border-red-500/55 bg-[#1a0a12]/45 px-4 py-3 shadow-[0_0_20px_rgba(255,80,80,0.2)]">
              <p className="text-white text-[1.05rem] sm:text-xl font-mono">
                <span className="mr-2 text-2xl">{lastAttacker?.emoji ?? '🔥'}</span>
                Killed by <span className="font-bold text-red-400">{lastAttacker?.name ?? 'Unknown Threat'}</span>{' '}
                {lastAttacker && (
                  <span className={`${lastAttacker.level >= 100 ? 'text-red-400' : lastAttacker.level >= 71 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    (Lv{lastAttacker.level}[{lastAttacker.level >= 71 ? 'MID' : 'LOW'}])
                  </span>
                )}
              </p>
              <p className="mt-1 text-yellow-200 text-sm sm:text-base font-mono">
                Cause: {lastThreatType ? getThreatName(lastThreatType) : 'Unknown Cause'}
              </p>
            </div>

            <div className="mb-5 text-white font-mono text-2xl sm:text-3xl tracking-wide">
              <span className="text-gray-300">Level:</span> <span className="font-extrabold text-cyan-300">{level}</span>
              <span className="mx-3 text-gray-500">•</span>
              <span className="text-gray-300">Score:</span> <span className="font-extrabold text-yellow-300">{score}</span>
            </div>

            <div className="rounded-[24px] border-2 border-cyan-300/80 bg-[#050c1b]/82 px-3 py-4 sm:px-5 sm:py-5 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
              <h3 className="mb-4 flex items-center justify-center gap-3 text-cyan-100 text-[1.8rem] sm:text-[2.2rem] font-black font-mono tracking-[0.16em]">
                <span className="h-px w-10 sm:w-14 bg-cyan-300/65" />
                <span>⚡ CONTINUE RUN</span>
                <span className="h-px w-10 sm:w-14 bg-cyan-300/65" />
              </h3>

              <button
                onClick={() => {
                  if (lastThreatType) {
                    const kit = getProtectionKitForThreat(lastThreatType)
                    if (kit) trackQuizAttempt(kit.id)
                  }
                  setShowQuiz(true)
                }}
                className="w-full rounded-full border border-cyan-100/55 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 px-4 py-2.5 sm:py-3 text-[1.25rem] sm:text-[1.5rem] font-black font-mono tracking-[0.12em] text-white shadow-[0_0_26px_rgba(80,200,255,0.55)]"
              >
                CONTINUE RUN
              </button>

              <p className="mt-3 text-gray-200 text-[1rem] sm:text-[1.2rem] font-mono">
                Take 30s quiz to keep level & kits
              </p>

              <div className="my-4 h-px bg-cyan-300/20" />

              <button
                onClick={handleRestart}
                className="w-full rounded-full border border-cyan-300/45 bg-[#07101f]/78 px-4 py-2.5 sm:py-3 text-[1.15rem] sm:text-[1.35rem] font-semibold font-mono tracking-[0.05em] text-cyan-100 hover:border-cyan-300/75 transition-colors"
              >
                Restart from scratch
              </button>
            </div>

            <div className="mt-5 text-white font-mono text-[1.2rem] sm:text-[1.4rem]">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-white hover:text-cyan-200 transition-colors"
              >
                Sign in to save score
              </button>
              <span className="mx-3 text-gray-400">•</span>
              <button
                onClick={async () => {
                  const tweetText = `I just scored ${score} points in Byte Runner! 🎮🔐\n\nCan you beat my score?\n\nPlay now: ${window.location.origin}`
                  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
                  window.open(tweetUrl, '_blank', 'width=550,height=420')
                  try {
                    await recordShare('twitter', score)
                    trackSocialShare('twitter', score)
                  } catch (error) {
                    console.error('Failed to record share:', error)
                  }
                }}
                className="font-semibold hover:text-cyan-200 transition-colors"
              >
                Share run
              </button>
            </div>

            {lastThreatType && (
              <button
                onClick={() => {
                  const kit = getProtectionKitForThreat(lastThreatType)
                  if (kit) trackDeepDiveViewed(kit.id)
                  ui.actions.toggleLearnMore()
                }}
                className="mt-3 text-cyan-300 text-[1.2rem] sm:text-[1.35rem] font-mono hover:text-cyan-200 transition-colors"
              >
                More details →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal moved to home screen */}

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[#0b1020]/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_26px_rgba(0,200,255,0.2)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-cyan-200 font-mono text-sm sm:text-base font-bold tracking-wide">
                Choose a username
              </h3>
              <button
                onClick={() => setShowUsernameModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-colors"
                aria-label="Close username"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUsernameSubmit} className="space-y-3">
              <input
                type="text"
                value={usernameInput}
                onChange={(event) => setUsernameInput(event.target.value)}
                className="w-full bg-black/40 border border-cyan-600/40 rounded-md px-3 py-2 text-cyan-100 text-sm font-mono"
                placeholder="3-16 letters, numbers, underscores"
                minLength={3}
                maxLength={16}
                required
              />
              {usernameError && (
                <p className="text-red-300 text-xs font-mono">{usernameError}</p>
              )}
              <button
                type="submit"
                disabled={usernameLoading}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black py-2 rounded-full text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(80,255,160,0.45)] disabled:opacity-60"
              >
                {usernameLoading ? 'SAVING...' : 'SET USERNAME'}
              </button>
            </form>
            <p className="mt-2 text-[11px] text-gray-300 font-mono">
              This name will appear on the leaderboard.
            </p>
          </div>
        </div>
      )}
      
      {/* Knowledge Card Modal - Deep Learning */}
      {ui.state.showLearnMore && lastThreatType && (() => {
        const protectionKit = getProtectionKitForThreat(lastThreatType)
        return protectionKit ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 overflow-y-auto p-3 md:p-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <div className="bg-[#0b1020]/65 border-2 border-cyan-400/40 rounded-2xl p-4 sm:p-5 max-w-2xl w-full mx-auto my-auto max-h-[90svh] overflow-y-auto relative [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400 shadow-[0_0_30px_rgba(0,200,255,0.2)]">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <h2 className="text-cyan-200 text-base sm:text-lg md:text-xl font-bold font-mono tracking-wide">WHY DID I DIE?</h2>
                </div>
                <button
                  onClick={() => {
                    const protectionKit = getProtectionKitForThreat(lastThreatType)
                    if (protectionKit) {
                      setBonusKitType(protectionKit.id)
                    }
                    ui.actions.toggleLearnMore()
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-md border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-colors"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-mono">
                <div className="border-b border-cyan-500/20 pb-2">
                  <p className="text-red-300 flex items-center gap-2">
                    <span>⚠️</span>
                    <span className="uppercase tracking-wide">Cause</span>
                  </p>
                  <p className="text-yellow-200 mt-1">{getThreatName(lastThreatType)}</p>
                </div>

                <div className="border-b border-cyan-500/20 pb-2">
                  <p className="text-cyan-300 flex items-center gap-2">
                    <span>🛡️</span>
                    <span className="uppercase tracking-wide">Missing protection</span>
                  </p>
                  <p className="text-cyan-100 mt-1">{protectionKit.name}</p>
                </div>

                <div className="border-b border-cyan-500/20 pb-2">
                  <p className="text-gray-300 uppercase tracking-wide">Summary</p>
                  <p className="text-gray-200 mt-1">{protectionKit.whyItMatters}</p>
                  <button
                    onClick={() => {
                      const kit = getProtectionKitForThreat(lastThreatType)
                      if (kit) trackDeepDiveViewed(kit.id)
                    }}
                    className="text-cyan-300 mt-2 hover:text-cyan-200 transition-colors"
                  >
                    More details →
                  </button>
                </div>

                <div className="border-b border-cyan-500/20 pb-2">
                  <p className="text-gray-300 uppercase tracking-wide">What happened</p>
                  <p className="text-gray-200 mt-1">{protectionKit.whatItIs}</p>
                  <p className="text-gray-200 mt-2">{protectionKit.howItWorks}</p>
                </div>

                <div className="border-b border-cyan-500/20 pb-2">
                  <p className="text-gray-300 uppercase tracking-wide">Real-world example</p>
                  <p className="text-gray-200 mt-1">{protectionKit.realWorldExample.title}</p>
                  <p className="text-gray-200 mt-1">{protectionKit.realWorldExample.description}</p>
                </div>

                <div>
                  <p className="text-gray-300 uppercase tracking-wide">How this is prevented</p>
                  <ul className="text-gray-200 mt-1 space-y-1 list-disc list-inside">
                    {protectionKit.learningPoints.slice(0, 3).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null
      })()}
      
      {/* Bonus Kit Notification */}
      {ui.state.showBonusNotification && bonusKitType && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-yellow-400 rounded-lg px-8 py-4 z-20 animate-bounce">
          <p className="text-yellow-300 text-2xl font-bold text-center">🎁 BONUS REWARD ACTIVE!</p>
          <p className="text-white text-lg text-center mt-2">
            Starting with +1 {getProtectionKitById(bonusKitType)?.emoji} {getProtectionKitById(bonusKitType)?.name} Kit!
          </p>
          <p className="text-yellow-200 text-sm text-center mt-1 italic">You earned this by learning!</p>
        </div>
      )}
      
      {/* Quiz Modal */}
      {showQuiz && lastThreatType && (
        <QuizModal
          kitType={getProtectionKitForThreat(lastThreatType)?.id || 'password-manager'}
          level={level}
          onPass={handleQuizPass}
          onFail={handleQuizFail}
        />
      )}
    </div>
  )
}
