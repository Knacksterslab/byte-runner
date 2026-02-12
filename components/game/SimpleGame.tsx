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
import { LeaderboardPanel } from './ui/LeaderboardPanel'
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
  const [showLeaderboardMobile, setShowLeaderboardMobile] = useState(false)
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
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState(false)
  const [activeContests, setActiveContests] = useState<Contest[]>([])
  const authLabelRef = useRef('Guest • Sign in')
  const showQuizOverlayRef = useRef(false)
  
  // Track all timeouts for cleanup to prevent memory leaks
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  
  // Use custom hooks for state management
  const quiz = useQuizState()
  const tutorial = useTutorialState()
  const ui = useUIState()
  const router = useRouter()
  
  const { distance, score, isGameOver, lastAttacker, lastThreatType, setDistance, addScore, setGameOver, setRunning, setLastAttacker, resetGame, addLeaderboardEntry, setLeaderboard } = useGameStore()

  
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
    authLabelRef.current = authStatus === 'authed'
      ? `${currentUser?.username || 'Player'} • Sign out`
      : 'Guest • Sign in'
  }, [authStatus, currentUser?.username])

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
      setLeaderboardLoading(true)
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
        setLeaderboardEntries(mapped)
        setLeaderboard(mapped.slice(0, 10)) // Sync top 10 to game store for display
      } catch {
        if (!isActive) return
        setLeaderboardEntries([])
      } finally {
        if (isActive) setLeaderboardLoading(false)
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

  // Preload sprites and show loading screen
  useEffect(() => {
    if (!isMounted) return
    
    const images = {
      virus: new Image(),
      firewall: new Image(),
      malware: new Image(),
      dataBreach: new Image(),
      spamWave: new Image(),
      dataPacket: new Image()
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
      dataPacket: new Image()
    }
    
    images.virus.src = '/assets/sprites/virus.png'
    images.firewall.src = '/assets/sprites/firewall.png'
    images.malware.src = '/assets/sprites/malware.png'
    images.dataBreach.src = '/assets/sprites/data-breach.png'
    images.spamWave.src = '/assets/sprites/spam-wave.png'
    images.dataPacket.src = '/assets/sprites/data-packet.png'
    
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
    
    // Level state
    let currentLevel = 1
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
        return
      }

      drawRecoveryOverlayForKit()
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
      
      // Flash effect
      if (quizCompletionSuccess) {
        ctx.fillStyle = `rgba(0, 255, 0, ${0.3 * (quizCompletionTimer / 2000)})`
      } else {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * (quizCompletionTimer / 2000)})`
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Message box
      const overlayWidth = 600
      const overlayHeight = 200
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
      ctx.font = `bold ${Math.floor(48 * pulse)}px monospace`
      ctx.fillStyle = quizCompletionSuccess ? '#00ff00' : '#ff0000'
      ctx.textAlign = 'center'
      ctx.fillText(
        quizCompletionSuccess ? '✅ QUIZ PASSED!' : '❌ QUIZ FAILED',
        canvas.width / 2,
        canvas.height / 2 - 20
      )
      
      // Sub text
      ctx.font = 'bold 24px monospace'
      ctx.fillStyle = '#ffffff'
      if (quizCompletionSuccess) {
        ctx.fillText('Speed Boost Activated! +500 Points', canvas.width / 2, canvas.height / 2 + 40)
      } else {
        ctx.fillText('Continue with current speed', canvas.width / 2, canvas.height / 2 + 40)
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
      quiz.actions.startQuiz(currentLevel)
      
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
        // Apply speed bonus
        if (quiz.refs.currentQuizRef.current) {
          obstacleSpeed *= quiz.refs.currentQuizRef.current.speedBonus
          addScore(500) // Bonus points for completing quiz
          
          // Show success message
          showQuizCompletionMessage = true
          quizCompletionSuccess = true
          quizCompletionTimer = 2000
        }
      } else {
        // Show failure message
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
      
      
      if (allItemsGone || quiz.refs.timeRemainingRef.current === 0) {
        // Calculate score using REF (not state)
        const correctAnswers = quiz.refs.currentQuizRef.current.correctAnswers
        const correctCollected = quiz.refs.itemsCollectedRef.current.filter(id => correctAnswers.includes(id)).length
        const incorrectCollected = quiz.refs.itemsCollectedRef.current.filter(id => !correctAnswers.includes(id)).length
        
        // Need to collect at least 2/3 correct answers to pass
        const passingScore = Math.ceil(correctAnswers.length * 0.67)
        const success = correctCollected >= passingScore && incorrectCollected === 0
        
        
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
      
      // Zone-based difficulty progression (bigger jumps at zone transitions!)
      if (isZoneTransition(currentLevel)) {
        // Zone transition = major difficulty spike
        obstacleSpeed += 1.0
        spawnFrequency = Math.max(260, spawnFrequency - 70)
      } else {
        // Within zone = gradual increase
        obstacleSpeed += 0.3
        spawnFrequency = Math.max(320, spawnFrequency - 20)
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
      const speedMultiplier = 1 + (currentLevel * 0.1) // Gradual increase
      
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
      if (/[^\x20-\x7E]/.test(quizData.question) || /[^\x20-\x7E]/.test(quizData.instructions)) {
}
      
      // Show countdown intro before actual quiz
      if (countdown > 0) {
        // Full screen dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Pulsing countdown number
        const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7
        ctx.font = `bold ${Math.floor(180 * pulse)}px monospace`
        ctx.fillStyle = '#00ffff'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 40
        ctx.shadowColor = '#00ffff'
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2)
        
        // "Get Ready" text
        ctx.font = 'bold 32px monospace'
        ctx.fillStyle = '#ffff00'
        ctx.shadowBlur = 10
        ctx.fillText('⚡ SECURITY CHALLENGE INCOMING ⚡', canvas.width / 2, canvas.height / 2 - 120)
        
        // Quiz type
        ctx.font = 'bold 24px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(quizData.question, canvas.width / 2, canvas.height / 2 + 100)
        
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
        return // Don't render quiz items during countdown
      }
      
      // Enhanced dark overlay with vignette effect for better focus
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)' // Slightly darker
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add subtle vignette effect
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      )
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // CLEAN: Simple quiz banner (high contrast, no effects)
      const bannerHeight = 100
      ctx.fillStyle = 'rgba(10, 27, 63, 0.95)'
      ctx.fillRect(0, 0, canvas.width, bannerHeight)
      
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, canvas.width, bannerHeight)
      
      // CLEAN: Large, clear title (no shadows)
      ctx.font = 'bold 28px monospace'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(quizData.question, canvas.width / 2, 35)
      
      // CLEAN: Simple instructions with color coding
      ctx.font = '16px monospace'
      ctx.fillStyle = '#ffffff'
      const collectText = 'Collect '
      const strongText = 'STRONG'
      const avoidText = ' · Avoid '
      const weakText = 'WEAK'
      
      const collectWidth = ctx.measureText(collectText).width
      const strongWidth = ctx.measureText(strongText).width
      const avoidWidth = ctx.measureText(avoidText).width
      
      const totalWidth = collectWidth + strongWidth + avoidWidth + ctx.measureText(weakText).width
      let xPos = canvas.width / 2 - totalWidth / 2
      
      ctx.fillText(collectText, xPos, 60)
      xPos += collectWidth
      ctx.fillStyle = '#00ff9c'
      ctx.fillText(strongText, xPos, 60)
      xPos += strongWidth
      ctx.fillStyle = '#ffffff'
      ctx.fillText(avoidText, xPos, 60)
      xPos += avoidWidth
      ctx.fillStyle = '#ff4d4d'
      ctx.fillText(weakText, xPos, 60)
      
      // CLEAN: High contrast score and timer
      ctx.font = 'bold 18px monospace'
      ctx.fillStyle = '#00ff9c'
      ctx.textAlign = 'left'
      ctx.fillText(`✅ ${quiz.state.score.correct}`, 40, 85)
      
      ctx.fillStyle = '#ff4d4d'
      ctx.fillText(`❌ ${quiz.state.score.incorrect}`, 140, 85)
      
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      const timeWarning = quiz.state.timeRemaining < 10
      ctx.fillStyle = timeWarning ? '#ff4d4d' : '#ffffff'
      ctx.fillText(`⏱ ${quiz.state.timeRemaining}s`, canvas.width - 40, 85)
      
      ctx.shadowBlur = 0
      ctx.textAlign = 'left'
      
      // Instructions at bottom (controls reminder)
      ctx.font = 'bold 18px monospace'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.shadowBlur = 3
      ctx.shadowColor = '#000000'
      ctx.fillText('💻 WASD / 📱 Touch to Move • Game in Slow Motion', canvas.width / 2, canvas.height - 30)
      ctx.shadowBlur = 0
      ctx.textAlign = 'left'
      
      // Render quiz items with labels
      powerups.forEach(item => {
        if (item.type === 'quiz-item') {
// Draw larger, well-spaced item (like mockup)
          const size = 120
          const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.95
          
          // Background box
          ctx.fillStyle = item.color
          ctx.fillRect(item.x - size / 2, item.y - size / 2, size, size)
          
          // Border
          ctx.strokeStyle = item.color === '#00ff00' ? '#00cc00' : '#cc0000'
          ctx.lineWidth = 3
          ctx.strokeRect(item.x - size / 2, item.y - size / 2, size, size)
          
          // Password text - clear and readable (no emojis)
          ctx.font = 'bold 16px monospace'
          ctx.textAlign = 'center'
          const rawName = item.sentBy.name
          const passwordText = rawName.replace(/[^\x20-\x7E]/g, '')
const passwordWidth = ctx.measureText(passwordText).width
          const textBgPaddingX = 6
          const textBgHeight = 20
          const textTopY = item.y - size / 2 + 26
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
          ctx.fillRect(
            item.x - passwordWidth / 2 - textBgPaddingX,
            textTopY - textBgHeight + 6,
            passwordWidth + textBgPaddingX * 2,
            textBgHeight
          )
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#000000'
          ctx.shadowBlur = 3
          ctx.fillText(passwordText, item.x, textTopY)
          ctx.shadowBlur = 0
          
          // Character count badge at bottom (like mockup)
          const charCount = item.sentBy.name.length
          const badgeText = `${charCount} characters`
          const badgeColor = charCount >= 8 ? '#00ff00' : '#ff0000'
          
          ctx.font = 'bold 11px monospace'
          const badgeWidth = 100
          const badgeHeight = 18
          ctx.fillStyle = badgeColor
          ctx.fillRect(item.x - badgeWidth / 2, item.y + 28, badgeWidth, badgeHeight)
          ctx.fillStyle = '#000000'
          ctx.fillText(badgeText, item.x, item.y + 41)
          
          // Subtle glow effect
          ctx.shadowBlur = 15 * pulse
          ctx.shadowColor = item.color
          ctx.strokeStyle = item.color
          ctx.lineWidth = 2
          ctx.strokeRect(item.x - size / 2, item.y - size / 2, size, size)
          ctx.shadowBlur = 0
          
          ctx.textAlign = 'left'
        }
      })
    }
// Draw animated cyber background with color progression
    function drawBackground() {
// CLEAN: Simple deep space background (no clutter)
      // Cache gradient to avoid recreating it every frame (Chrome performance issue)
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
// CLEAN: Simple subtle stars (no effects, no grid, no icons)
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
        ctx.globalAlpha = twinkle * 0.6
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
      speedFactor = Math.min(1.6, Math.max(0.55, 0.55 + (currentLevel - 1) * 0.08))
      threatSpeedFactor = Math.min(1.4, Math.max(0.38, 0.38 + (currentLevel - 1) * 0.07))
      spawnFactor = Math.min(1.6, Math.max(1.1, 1.1 + (currentLevel - 1) * 0.05))
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
      
      // Draw kit inventory and progress (RESPONSIVE for mobile!)
      const isMobile = canvas.width < 768
      const isReactQuizOpen = showQuizOverlayRef.current
      const isInGameQuizActive = quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0
      const shouldHideHud = isReactQuizOpen || isInGameQuizActive
      
      if (isMobile && !shouldHideHud) {
        // MOBILE: Collapsible HUD (top-right)
        const kitX = canvas.width - 110
        const kitY = 80
        
        if (!ui.state.mobileHudExpanded) {
          // COLLAPSED STATE - Minimal HUD
          const hudWidth = 100
          const hudHeight = 80
          const cornerRadius = 10
          
          // Semi-transparent background with pulse effect
          const pulse = Math.sin(Date.now() / 1000) * 0.1 + 0.85
          ctx.fillStyle = `rgba(0, 0, 0, ${pulse})`
          ctx.beginPath()
          ctx.roundRect(kitX, kitY, hudWidth, hudHeight, cornerRadius)
          ctx.fill()
          
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // CLEAN: Level and rank (pure white, high contrast)
          ctx.font = 'bold 13px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'left'
          const rank = getRank()
          ctx.fillText(`L${currentLevel}`, kitX + 8, kitY + 20)
          ctx.font = '9px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(rank.toUpperCase(), kitX + 8, kitY + 32)
          
          // Total kit count
          const totalKitsInInventory = calculateTotalKits(kitInventory)
          
          ctx.font = 'bold 16px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(`❤️${totalKitsInInventory}`, kitX + 8, kitY + 53)
          
          // Expand indicator (animated)
          ctx.font = 'bold 10px monospace'
          ctx.fillStyle = '#00ffff'
          const expandY = kitY + 70 + Math.sin(Date.now() / 300) * 2
          ctx.fillText('TAP ▼', kitX + 28, expandY)
          
        } else {
          // EXPANDED STATE - Full HUD
          const hudWidth = 140
          const kitColumns = 3
          const kitRowHeight = 16
          const kits = ALL_KIT_TYPES.map((kitId) => ({
            emoji: getKitIcon(kitId),
            count: kitInventory[kitId] || 0
          }))
          const kitRows = Math.ceil(kits.length / kitColumns)
          const hudHeight = 110 + kitRows * kitRowHeight
          const cornerRadius = 10
          
          // Semi-transparent background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
          ctx.beginPath()
          ctx.roundRect(kitX - 20, kitY, hudWidth, hudHeight, cornerRadius)
          ctx.fill()
          
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Level and rank
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#ffd700'
          ctx.textAlign = 'left'
          const rank = getRank()
          ctx.fillText(`L${currentLevel} ${rank}`, kitX - 15, kitY + 18)
          
          // Kit progress
          const kitsNeeded = calculateKitsNeededForNextLevel(currentLevel)
          const progressPercent = Math.min(totalKitsCollected / kitsNeeded, 1)
          ctx.font = '9px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(`${totalKitsCollected}/${kitsNeeded}`, kitX - 15, kitY + 33)
          
          // Progress bar
          const barWidth = 110
          const barHeight = 5
          ctx.fillStyle = '#333333'
          ctx.fillRect(kitX - 15, kitY + 38, barWidth, barHeight)
          ctx.fillStyle = '#00ff00'
          ctx.fillRect(kitX - 15, kitY + 38, barWidth * progressPercent, barHeight)
          
          // Kits - ICONS ONLY
          ctx.font = `13px ${EMOJI_FONT_STACK}`
          
          // Draw in compact grid
          for (let i = 0; i < kits.length; i++) {
            const col = i % kitColumns
            const row = Math.floor(i / kitColumns)
            const x = kitX - 10 + (col * 45)
            const y = kitY + 65 + (row * kitRowHeight)
            
            const kit = kits[i]
            const count = kit.count || 0
            ctx.fillStyle = count > 0 ? '#ffffff' : '#555555'
            ctx.fillText(`${kit.emoji}${count}`, x, y)
          }
          
          // Zone icon
          const currentZone = getCurrentZone(currentLevel)
          ctx.font = `18px ${EMOJI_FONT_STACK}`
          ctx.fillStyle = currentZone.colorScheme.accent
          const zoneY = kitY + hudHeight - 12
          ctx.fillText(currentZone.icon, kitX + 35, zoneY)
          
          // Collapse indicator
          ctx.font = 'bold 10px monospace'
          ctx.fillStyle = '#00ffff'
          ctx.fillText('TAP ▲', kitX + 28, zoneY)
        }
        
      } else if (!shouldHideHud) {
        // DESKTOP: Collapsible top-left HUD
        const hudX = 20
        const hudY = 80
        
        if (!ui.state.desktopHudExpanded) {
          // COLLAPSED STATE - Minimal info (like mockup)
          const hudWidth = 340
          const hudHeight = 70
          const cornerRadius = 12
          
          // Background with pulse - rounded corners
          const pulse = Math.sin(Date.now() / 1000) * 0.1 + 0.7
          ctx.fillStyle = `rgba(0, 0, 0, ${pulse})`
          ctx.beginPath()
          ctx.roundRect(hudX, hudY, hudWidth, hudHeight, cornerRadius)
          ctx.fill()
          
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // CLEAN: High contrast white text, larger fonts
          // Auth label (top left, very first)
          const authLabel = authLabelRef.current
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#7be9ff'
          ctx.textAlign = 'left'
          ctx.fillText(authLabel, hudX + 15, hudY + 12)
          
          // Level and rank on left
          ctx.font = 'bold 16px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'left'
          const rank = getRank()
          ctx.fillText(`LEVEL ${currentLevel} · ${rank.toUpperCase()}`, hudX + 15, hudY + 25)
          
          // Score on right of same line (high contrast)
          ctx.font = 'bold 18px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'right'
          ctx.fillText(`Score: ${score}`, hudX + hudWidth - 15, hudY + 25)
          
          // Total kits count with shield emoji
          const totalKitsInInventory = calculateTotalKits(kitInventory)
          
          ctx.font = 'bold 20px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'left'
          ctx.fillText(`❤️ ${totalKitsInInventory}`, hudX + 15, hudY + 52)
          
          // Expand indicator (small chevron)
          ctx.font = 'bold 10px monospace'
          ctx.fillStyle = '#00ffff'
          ctx.textAlign = 'right'
          const expandY = hudY + 55 + Math.sin(Date.now() / 300) * 1
          ctx.fillText('▼', hudX + hudWidth - 15, expandY)
          
          ctx.textAlign = 'left'
          
        } else {
          // EXPANDED STATE - Full details
          const kits = ALL_KIT_TYPES.map((kitId) => ({
            emoji: getKitIcon(kitId),
            count: kitInventory[kitId] || 0
          }))
          const kitColumns = 8
          const iconSpacingX = 32
          const iconSpacingY = 24
          const kitRows = Math.ceil(kits.length / kitColumns)
          const hudWidth = 460
          const hudHeight = 90 + (kitRows * iconSpacingY)
          const cornerRadius = 12
          
          // Background - rounded corners
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
          ctx.beginPath()
          ctx.roundRect(hudX, hudY, hudWidth, hudHeight, cornerRadius)
          ctx.fill()
          
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Auth label (top left, very first)
          const authLabel = authLabelRef.current
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#7be9ff'
          ctx.textAlign = 'left'
          ctx.fillText(authLabel, hudX + 10, hudY + 12)
          
          // Level and rank
          ctx.font = 'bold 14px monospace'
          ctx.fillStyle = '#ffd700'
          ctx.textAlign = 'left'
          const rank = getRank()
          ctx.fillText(`L${currentLevel} ${rank}`, hudX + 10, hudY + 20)
          
          // Score
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#ffff00'
          ctx.fillText(`Score: ${score}`, hudX + 10, hudY + 65)
          
          const kitsNeeded = calculateKitsNeededForNextLevel(currentLevel)
          const progressPercent = Math.min(totalKitsCollected / kitsNeeded, 1)
          ctx.font = '11px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(`${totalKitsCollected}/${kitsNeeded}`, hudX + 10, hudY + 37)
          
          // Mini progress bar
          const barWidth = 80
          const barHeight = 6
          ctx.fillStyle = '#333333'
          ctx.fillRect(hudX + 10, hudY + 42, barWidth, barHeight)
          ctx.fillStyle = '#00ff00'
          ctx.fillRect(hudX + 10, hudY + 42, barWidth * progressPercent, barHeight)
          
          // Kit icons in compact grid
          ctx.font = `16px ${EMOJI_FONT_STACK}`
          const startX = hudX + 100
          const startY = hudY + 40
          
          for (let i = 0; i < kits.length; i++) {
            const col = i % kitColumns
            const row = Math.floor(i / kitColumns)
            const x = startX + (col * iconSpacingX)
            const y = startY + (row * iconSpacingY)
            const kit = kits[i]
            const count = kit.count || 0
            
            // Kit icon
            ctx.fillStyle = count > 0 ? '#ffffff' : '#555555'
            ctx.fillText(kit.emoji, x, y)
            
            // Count below icon
            ctx.font = 'bold 9px monospace'
            ctx.fillStyle = count > 0 ? '#00ff00' : '#555555'
            ctx.fillText(`${count}`, x + 5, y + 12)
            ctx.font = '16px monospace'
          }
          
          // Zone indicator
          const currentZone = getCurrentZone(currentLevel)
          ctx.font = `20px ${EMOJI_FONT_STACK}`
          ctx.fillStyle = currentZone.colorScheme.accent
          ctx.fillText(currentZone.icon, hudX + 50, hudY + 92)
          
          // Collapse indicator
          ctx.font = 'bold 11px monospace'
          ctx.fillStyle = '#00ffff'
          ctx.fillText('▲', hudX + hudWidth - 18, hudY + 20)
        }
      }
      
      // Draw Threats From Panel (top-right) - desktop only - HIDDEN DURING QUIZ
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
          const threatIcons = uniqueCategories.slice(0, 3).map(cat => categoryEmojis[cat] || '⚠️')
          
          const panelWidth = 220
          const panelHeight = 110
          const panelX = canvas.width - panelWidth - 20
          const panelY = 20
          const cornerRadius = 12
          
          // Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
          ctx.beginPath()
          ctx.roundRect(panelX, panelY, panelWidth, panelHeight, cornerRadius)
          ctx.fill()
          
          ctx.strokeStyle = '#ff3300'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Header (warmer orange/red)
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#ff6600'
          ctx.textAlign = 'center'
          ctx.fillText('THREATS FROM:', panelX + panelWidth / 2, panelY + 18)
          
          // Threat icons in a row
          ctx.font = '28px monospace'
          ctx.fillStyle = '#ffffff'
          const iconSpacing = 50
          const startX = panelX + (panelWidth - (threatIcons.length - 1) * iconSpacing) / 2
          threatIcons.forEach((icon, i) => {
            ctx.fillText(icon, startX + i * iconSpacing, panelY + 52)
          })
          
          // CLEAN: Attacker name (pure white)
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#ffffff'
          const attackerName = closestThreat.sentBy?.name || 'UNKNOWN'
          // Truncate name if too long
          const maxNameLength = 18
          const displayName = attackerName.length > maxNameLength 
            ? attackerName.substring(0, maxNameLength) + '...' 
            : attackerName
          ctx.fillText(displayName, panelX + panelWidth / 2, panelY + 75)
          
          // CLEAN: Status (red = bad, green = safe)
          ctx.font = 'bold 11px monospace'
          const distance = Math.floor(Math.hypot(closestThreat.x - playerX, closestThreat.y - playerY))
          const status = distance < 100 ? 'CRITICAL' : distance < 200 ? 'NEAR' : 'SAFE'
          const statusColor = distance < 100 ? '#ff4d4d' : distance < 200 ? '#ff4d4d' : '#00ff9c'
          ctx.fillStyle = statusColor
          ctx.fillText(status, panelX + panelWidth / 2, panelY + 95)
          
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
// Check collision with obstacles (skip if player is invincible during quiz)
        const isPlayerInvincible = quiz.refs.activeRef.current || isHealing || isRestoring
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
            addScore(-25) // Cost for consuming kit
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
              addScore(-100) // Cost for consuming backup kit
              
              // Remove the threat
              returnObstacleToPool(obstacle)
              return false
            } else {
              // No kit AND no backup - game over
              // Save game state for quiz continuation option
              setSavedGameState({
                level: currentLevel,
                kits: { ...kitInventory },
                score: score
              })
              lastHitThreatId = obstacle.threatId
              setLastAttacker(obstacle.sentBy, obstacle.threatId)
              trackGameOver(currentLevel, score, obstacle.threatId)
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
        if (isQuizItem) {
}
        
        // Draw kit with pulsing glow
        const pulse = Math.sin(timestamp * 0.005) * 0.3 + 0.7
        const size = 35 * pulse
        
        ctx.shadowBlur = performanceMode ? 0 : 30 * pulse
        ctx.shadowColor = kit.color
        
        // Kit icon based on type
        let icon = '🔐'
        if (!isQuizItem && kit.type.startsWith('kit-')) {
          const kitId = kit.type.replace('kit-', '')
          icon = getKitIcon(kitId)
        }
        
        // Draw kit box
        ctx.fillStyle = kit.color + '88'
        ctx.fillRect(kit.x - size / 2, kit.y - size / 2, size, size)
        
        ctx.strokeStyle = kit.color
        ctx.lineWidth = 3
        ctx.strokeRect(kit.x - size / 2, kit.y - size / 2, size, size)
        
        // Draw icon; for quiz items, overlay password text on top
        ctx.font = `bold 24px ${EMOJI_FONT_STACK}`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(icon, kit.x, kit.y + 8)
        if (isQuizItem) {
          const rawQuizName = kit.sentBy?.name || ''
          const quizName = rawQuizName.replace(/[^\x20-\x7E]/g, '')
          ctx.font = 'bold 12px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#000000'
          ctx.shadowBlur = 3
          ctx.fillText(quizName, kit.x, kit.y - 10)
          ctx.shadowBlur = 0
}
        ctx.textAlign = 'left'
        
        ctx.shadowBlur = 0
        
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
              addScore(100)
              
              // Green flash for correct
              ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
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
            addScore(50)
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
      // Dynamic glow based on kits collected
      const totalKitsInInventory = calculateTotalKits(kitInventory)
      const glowIntensity = 20 + (totalKitsInInventory * 10) + (totalKitsCollected * 2)
      const glowSize = 30 + (totalKitsInInventory * 5)
      
      // Color changes based on rank
      let glowColor = '#00ffff' // Newbie - cyan
      const currentRank = getRank()
      if (currentRank === 'Analyst') {
        glowColor = '#00ff00' // Green
      } else if (currentRank === 'Expert') {
        glowColor = '#ffaa00' // Orange
      } else if (currentRank === 'Commando') {
        glowColor = '#ffd700' // Gold
      }
      
      // Multi-layered glow effect
      ctx.shadowBlur = performanceMode ? 0 : glowSize
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
        
        // Shield icon above player
        ctx.font = 'bold 32px monospace'
        ctx.fillStyle = `rgba(0, 255, 255, ${shieldPulse})`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ffff'
        ctx.fillText('🛡️', playerX, playerY - playerSize - 35)
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
        
        // "INVINCIBLE" text above shield icon
        ctx.font = 'bold 14px monospace'
        ctx.fillStyle = `rgba(0, 255, 255, ${shieldPulse})`
        ctx.textAlign = 'center'
        ctx.shadowBlur = 10
        ctx.shadowColor = '#00ffff'
        ctx.fillText('INVINCIBLE', playerX, playerY - playerSize - 55)
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
      
      // Draw character from center point with tilt
      ctx.save()
      ctx.translate(playerX, playerY)
      ctx.rotate((playerTilt * Math.PI) / 180) // Tilt character when moving left/right
      
      // HEAD
      ctx.fillStyle = glowColor
      ctx.beginPath()
      ctx.arc(0, -bodyHeight / 2 - headRadius, headRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Eyes (simple dots)
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(-headRadius * 0.3, -bodyHeight / 2 - headRadius - 2, headRadius * 0.15, 0, Math.PI * 2)
      ctx.arc(headRadius * 0.3, -bodyHeight / 2 - headRadius - 2, headRadius * 0.15, 0, Math.PI * 2)
      ctx.fill()
      
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
      
      // LEFT ARM (opposite of left leg)
      ctx.save()
      ctx.translate(-playerSize * 0.25, -bodyHeight * 0.3)
      ctx.rotate((-armSwing * Math.PI) / 180)
      ctx.fillStyle = glowColor
      ctx.fillRect(-limbWidth / 2, 0, limbWidth, limbLength)
      ctx.restore()
      
      // RIGHT ARM (opposite of right leg)
      ctx.save()
      ctx.translate(playerSize * 0.25, -bodyHeight * 0.3)
      ctx.rotate((armSwing * Math.PI) / 180)
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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix',hypothesisId:'C',location:'SimpleGame.tsx:2662',message:'game loop start',data:{canvasW:canvas.width,canvasH:canvas.height,performanceMode,isChrome},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
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
  }, [gameStarted, isGameOver, setDistance, addScore, setGameOver, setRunning, setLastAttacker, resetGame, setLevel, ui.state.mobileHudExpanded, ui.state.desktopHudExpanded])

  const refreshLeaderboard = async () => {
    setLeaderboardLoading(true)
    try {
      const entries = await getLeaderboard(50)
      const mapped: LeaderboardEntry[] = entries.map((entry, index) => ({
        id: `remote_${index}_${entry.createdAt}`,
        name: entry.username,
        score: entry.score,
        distance: entry.distance,
        createdAt: new Date(entry.createdAt).getTime()
      }))
      setLeaderboardEntries(mapped)
      setLeaderboard(mapped.slice(0, 10)) // Sync top 10 to game store for display
    } catch {
      setLeaderboardEntries([])
    } finally {
      setLeaderboardLoading(false)
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
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'debug',hypothesisId:'H2,H4',location:'SimpleGame.tsx:handleAuth',message:'Auth flow starting',data:{mode:authMode},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log

      const result = authMode === 'signup'
        ? await signUp(authEmail.trim(), authPassword)
        : await signIn(authEmail.trim(), authPassword)

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'debug',hypothesisId:'H2,H4',location:'SimpleGame.tsx:handleAuth',message:'Auth completed, calling getCurrentUser',data:{resultStatus:result.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log

      if (result.status !== 'OK') {
        const fieldError = result.formFields?.find((field) => field.error)?.error
        setAuthError(result.message || fieldError || 'Authentication failed.')
        setAuthLoading(false)
        return
      }

      const user = await getCurrentUser()
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'debug',hypothesisId:'H2,H3,H4',location:'SimpleGame.tsx:handleAuth',message:'getCurrentUser returned',data:{hasUser:!!user,username:user?.username},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log

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

  const handleViewLeaderboard = () => {
    router.push('/leaderboard')
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
      setLevel(savedGameState.level)
      // Score and kits will be restored from savedGameState in useEffect
    }
    setGameOver(false)
    setGameStarted(true)
    // Clear saved state after a brief delay (after game loop starts)
    const tid = setTimeout(() => setSavedGameState(null), 100)
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
            onViewLeaderboard={handleViewLeaderboard}
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
      {!showQuiz && (
        <>
          {/* HUD - RESPONSIVE FOR MOBILE */}
          <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start text-white font-mono text-sm md:text-xl z-10 pointer-events-none">
            <div className="space-y-1 md:space-y-2 pointer-events-auto">
              {/* Mobile auth chip */}
              <button
                onClick={authStatus === 'authed' ? handleSignOut : () => setShowAuthModal(true)}
                className="md:hidden bg-black/80 border border-cyan-600 rounded px-2 py-1 text-[10px] font-mono text-cyan-100 hover:text-cyan-50 transition-colors"
                title={authStatus === 'authed' ? 'Sign out' : 'Sign in'}
              >
                {authStatus === 'authed'
                  ? `${currentUser?.username || 'Player'} • Sign out`
                  : 'Guest • Sign in'}
              </button>
              {/* Mobile only - level and score shown in canvas HUD on desktop */}
              <div className="md:hidden bg-black/80 border border-cyan-600 rounded px-2 py-1">
                <span className="text-[10px]">L:</span> <span className="text-cyan-400 font-bold text-sm">{level}</span>
              </div>
              <div className="md:hidden bg-black/80 border border-yellow-600 rounded px-2 py-1">
                <span className="text-[10px]">S:</span> <span className="text-yellow-400 font-bold text-sm">{score}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!showQuiz && (
        <div className="hidden md:block absolute bottom-4 right-4 z-10 pointer-events-none">
          <LeaderboardPanel title="Top Runs" maxEntries={5} entries={leaderboardEntries} loading={leaderboardLoading} />
        </div>
      )}

      {!showQuiz && (
        <button
          onClick={() => setShowLeaderboardMobile(true)}
          className="md:hidden absolute bottom-4 right-4 bg-black/80 border border-cyan-700 text-cyan-200 text-xs font-mono px-3 py-2 rounded-full shadow-lg z-10 pointer-events-auto"
          title="Show leaderboard"
        >
          🏆 Top Runs
        </button>
      )}

      {!showQuiz && showLeaderboardMobile && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowLeaderboardMobile(false)}
        >
          <div
            className="w-full max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowLeaderboardMobile(false)}
                className="text-gray-300 hover:text-white text-lg font-bold"
                aria-label="Close leaderboard"
              >
                ✕
              </button>
            </div>
            <LeaderboardPanel title="Top Runs" maxEntries={8} entries={leaderboardEntries} loading={leaderboardLoading} />
          </div>
        </div>
      )}
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        tabIndex={0}
      />

      {/* Feedback Button - During Gameplay */}
      {!showQuiz && (
        <button
          onClick={() => {
            window.open('mailto:connect@knacksters.co?subject=Byte Runner Feedback&body=Hi! Here\'s my feedback about Byte Runner:%0D%0A%0D%0A', '_blank')
          }}
          className="absolute bottom-4 left-3 md:left-4 bg-cyan-500/90 hover:bg-cyan-400 text-white text-xs md:text-sm font-semibold py-2 px-3 md:px-4 rounded-full transition-all shadow-[0_0_16px_rgba(80,200,255,0.6)] hover:scale-105 flex items-center gap-2 z-10 pointer-events-auto backdrop-blur-sm border border-cyan-200/40"
          aria-label="Send feedback"
          title="Send feedback"
        >
          <span className="text-base">📝</span>
          <span className="hidden sm:inline">Feedback</span>
        </button>
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
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  )
}
