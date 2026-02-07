'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'
import { getRandomThreat, getThreatName, getQuickTip, type ThreatType, type ThreatCategory } from '@/lib/game/threatData'
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
import { useQuizState } from './hooks/useQuizState'
import { useTutorialState } from './hooks/useTutorialState'
import { useUIState } from './hooks/useUIState'
import { LoadingScreen } from './ui/LoadingScreen'
import { TutorialOverlay } from './ui/TutorialOverlay'
import { StartScreen } from './ui/StartScreen'
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
  
  // Track all timeouts for cleanup to prevent memory leaks
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  
  // Use custom hooks for state management
  const quiz = useQuizState()
  const tutorial = useTutorialState()
  const ui = useUIState()
  
  const { distance, score, isGameOver, lastAttacker, lastThreatType, setDistance, addScore, setGameOver, setRunning, setLastAttacker, resetGame } = useGameStore()

  const isDev = process.env.NODE_ENV !== 'production'
  const debugIngest = (payload: Record<string, unknown>) => {
    if (!isDev) return
    fetch('http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {})
  }
  
  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
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
    if (!(ctx as any).__debugFillTextWrapped) {
      ;(ctx as any).__debugFillTextWrapped = true
      const originalFillText = ctx.fillText.bind(ctx)
      ctx.fillText = ((text: string, x: number, y: number, maxWidth?: number) => {
        const hasNonAscii = typeof text === 'string' && /[^\x20-\x7E]/.test(text)
        const hasLockEmoji =
          typeof text === 'string' && /[\uD83D\uDD12\uD83D\uDD10]/.test(text)
        if (hasNonAscii || hasLockEmoji) {
          // #region agent log
          debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H7',location:'SimpleGame.tsx:fillTextWrap',message:'fillText drew non-ascii/lock',data:{hasNonAscii,hasLockEmoji,textLength:typeof text === 'string' ? text.length : null,x,y,font:ctx.font},timestamp:Date.now()})
          // #endregion
        }
        return originalFillText(text as any, x as any, y as any, maxWidth as any)
      }) as any
    }
    
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
    
    // Game state
    let animationId: number
    let gameTime = 0 // Track game time for spawn timestamps
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
    let spawnFrequency = 650 // ms between obstacle spawns
    
    // Animation state for running character
    let animationTime = 0
    let playerTilt = 0 // Character tilt angle (-15 to 15 degrees)
    let previousPlayerX = playerX // Track previous position for movement detection
    let previousPlayerY = playerY
    
    // Celebration state
    let celebrationTimer = 0
    const CELEBRATION_DURATION = 300 // ms
    
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
      return obstaclePool.find(obj => !obj.active) || null
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
    const particleCount = performanceMode ? 60 : 100
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
    function showTutorial(kitType: string) {
      showingTutorial = true
      tutorialKit = kitType
      tutorialTimer = TUTORIAL_DURATION
      isHealing = true // Freeze player during healing
    }
    
    // Calculate kits needed for next level (based on total kit types)
    // Level 1→2: 1 of each type
    // Level 2→3: 2 of each type
    // Level 3→4: 3 of each type
    function calculateKitsNeededForNextLevel(level: number): number {
      return level * ALL_KIT_TYPES.length
    }
    
    // Draw tutorial overlay (healing process - freezes player)
    function drawTutorialOverlay() {
      if (!showingTutorial || tutorialTimer <= 0) {
        showingTutorial = false
        isHealing = false // End healing - player can move again
        return
      }
      
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
      
      // Pulse effect
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
      
      // Blue flash (restoration happening)
      const flashOpacity = restorationTimer / RESTORATION_DURATION
      ctx.fillStyle = `rgba(0, 200, 255, ${0.4 * flashOpacity})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Center message
      ctx.font = `bold ${Math.floor(64 * pulse)}px monospace`
      ctx.fillStyle = '#00ccff'
      ctx.textAlign = 'center'
      ctx.shadowBlur = 40
      ctx.shadowColor = '#00ccff'
      ctx.fillText('💾 RESTORING FROM BACKUP!', canvas.width / 2, canvas.height / 2 - 40)
      
      // Sub text
      ctx.font = 'bold 32px monospace'
      ctx.fillStyle = '#00ff00'
      ctx.fillText('DATA RECOVERED', canvas.width / 2, canvas.height / 2 + 20)
      
      // Extra life indicator
      ctx.font = 'bold 24px monospace'
      ctx.fillStyle = '#ffff00'
      ctx.fillText('+100 BONUS POINTS', canvas.width / 2, canvas.height / 2 + 60)
      
      ctx.shadowBlur = 0
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
        // #region agent log
        debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1',location:'SimpleGame.tsx:spawnQuizItems',message:'spawn quiz item label/visual',data:{id:item.id,label:item.label,visual:item.visual,type:quizChallenge.type},timestamp:Date.now()})
        // #endregion
        
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
        // #region agent log
        debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2',location:'SimpleGame.tsx:spawnQuizItems',message:'pushed quiz powerup sentBy.name',data:{id:item.id,name:item.label},timestamp:Date.now()})
        // #endregion
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
        spawnFrequency = Math.max(200, spawnFrequency - 100)
      } else {
        // Within zone = gradual increase
        obstacleSpeed += 0.3
        spawnFrequency = Math.max(300, spawnFrequency - 30)
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
          obstacle.vy = obstacleSpeed * speedMultiplier
          break
        case 'bottom':
          obstacle.x = Math.random() * canvas.width
          obstacle.y = canvas.height + 50
          obstacle.vx = (Math.random() - 0.5) * 2
          obstacle.vy = -obstacleSpeed * speedMultiplier // Move upward
          break
        case 'right':
          obstacle.x = canvas.width + 50
          obstacle.y = Math.random() * canvas.height
          obstacle.vx = -obstacleSpeed * speedMultiplier // Move leftward
          obstacle.vy = (Math.random() - 0.5) * 2
          break
        case 'left':
          obstacle.x = -50
          obstacle.y = Math.random() * canvas.height
          obstacle.vx = obstacleSpeed * speedMultiplier // Move rightward
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
        // #region agent log
        debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5',location:'SimpleGame.tsx:drawQuizOverlay',message:'quiz header has non-ascii',data:{question:quizData.question,instructions:quizData.instructions},timestamp:Date.now()})
        // #endregion
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
          // #region agent log
          debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'SimpleGame.tsx:drawQuizItem',message:'quiz powerup info',data:{type:item.type,color:item.color,speciality:item.sentBy?.speciality,name:item.sentBy?.name},timestamp:Date.now()})
          // #endregion
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
          // #region agent log
          debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3',location:'SimpleGame.tsx:drawQuizItem',message:'quiz item render name vs sanitized',data:{rawName,hasNonAscii:/[^\x20-\x7E]/.test(rawName),passwordText},timestamp:Date.now()})
          // #endregion
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
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      )
      gradient.addColorStop(0, '#0b1020')
      gradient.addColorStop(1, '#02030a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // CLEAN: Simple subtle stars (no effects, no grid, no icons)
      particles.forEach(particle => {
        particle.y += particle.speed
        if (particle.y > canvas.height) {
          particle.y = 0
          particle.x = Math.random() * canvas.width
        }
        
        // Simple stars - white only, subtle twinkle
        const twinkle = performanceMode
          ? 0.6
          : Math.sin(Date.now() / 800 + particle.x) * 0.3 + 0.7
        ctx.globalAlpha = twinkle * 0.6
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.globalAlpha = 1.0
      
      // Update offset for animation
      bgOffset += obstacleSpeed
      if (bgOffset > 50) bgOffset = 0
    }
    
    // Game loop
    function gameLoop(timestamp: number) {
      if (!ctx) return
      
      // Apply slow-motion effect during quiz (only after countdown finishes)
      const slowMotionMultiplier = (quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0) ? 0.15 : 1.0
      
      // Draw animated background
      drawBackground()
      
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
          playerY -= playerSpeed
        }
        if (keys['s'] || keys['S'] || keys['ArrowDown']) {
          playerY += playerSpeed
        }
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
          playerX -= playerSpeed
        }
        if (keys['d'] || keys['D'] || keys['ArrowRight']) {
          playerX += playerSpeed
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
        celebrationTimer -= 16 // Decrease by frame time
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
      
      if (isMobile) {
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
        
      } else {
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
      const isQuizActive = quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0
      if (canvas.width >= 768 && obstacles.length > 0 && !isQuizActive) {
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
        if (timestamp - lastSpawn > spawnFrequency) {
          spawnObstacle()
          lastSpawn = timestamp
        }
        
        // Spawn kits periodically
        if (timestamp % 5000 < 50) { // Approximately every 5 seconds
          spawnKit()
        }
      }
      
      // Update game time
      gameTime += 16 // Approximately 16ms per frame at 60fps
      
      // Update and draw obstacles (apply slow-motion during quiz)
      obstacles = obstacles.filter(obstacle => {
        if (!isHealing) {
          obstacle.y += obstacle.vy * slowMotionMultiplier
          obstacle.x += obstacle.vx * slowMotionMultiplier
        }
        
        // Bounce off edges for boss attacks (creates zigzag pattern)
        if (obstacle.type === 'boss-attack') {
          if (obstacle.x < 50 || obstacle.x > canvas.width - 50) {
            obstacle.vx = -obstacle.vx // Reverse horizontal direction
          }
        }
        
        // Culling: only draw if visible on screen
        const isVisible = obstacle.y > -100 && obstacle.y < canvas.height + 100
        
        // Skip drawing obstacles during quiz mode (clean focus like mockup)
        const isQuizActive = quiz.refs.activeRef.current && quiz.refs.countdownRef.current === 0
        
        if (isVisible && !isQuizActive) {
          // CLEAN: Removed shadow effects for better performance and clarity
          ctx.shadowBlur = 0
          
          if (obstacle.type === 'boss-attack') {
            // Boss attacks are circles with motion trails
            // Draw trail effect
            const trailLength = 3
            for (let t = 0; t < trailLength; t++) {
              const alpha = (trailLength - t) / trailLength * 0.4
              const trailX = obstacle.x - obstacle.vx * t * 2
              const trailY = obstacle.y - obstacle.vy * t * 2
              
              ctx.fillStyle = obstacle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
              ctx.beginPath()
              ctx.arc(trailX, trailY, (obstacle.width / 2) * (1 - t / trailLength * 0.3), 0, Math.PI * 2)
              ctx.fill()
            }
            
            // Draw main attack
            ctx.fillStyle = obstacle.color
            ctx.beginPath()
            ctx.arc(obstacle.x, obstacle.y, obstacle.width / 2, 0, Math.PI * 2)
            ctx.fill()
            
            // Add direction indicator (arrow)
            if (Math.abs(obstacle.vx) > 0.5) {
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 20px monospace'
              ctx.textAlign = 'center'
              ctx.fillText(obstacle.vx > 0 ? '→' : '←', obstacle.x, obstacle.y + 6)
              ctx.textAlign = 'left'
            }
          } else {
            // Draw sprite if available, otherwise fallback to colored square
            const sprite = threatToSprite[obstacle.threatId]
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
          }
          ctx.shadowBlur = 0
        }
        
        // Show ghost player name for first 2 seconds (2000ms) - HIDDEN DURING QUIZ
        const timeSinceSpawn = gameTime - (obstacle.spawnTime || 0)
        if (timeSinceSpawn < 2000 && obstacle.sentBy && obstacle.type !== 'boss-attack' && !isQuizActive) {
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
          
          ctx.font = `bold ${fontSize}px ${EMOJI_FONT_STACK}`
          ctx.fillStyle = `rgba(${parseInt(nameColor.slice(1, 3), 16)}, ${parseInt(nameColor.slice(3, 5), 16)}, ${parseInt(nameColor.slice(5, 7), 16)}, ${opacity})`
          ctx.textAlign = 'center'
          ctx.shadowBlur = performanceMode ? 0 : 8
          ctx.shadowColor = `rgba(${parseInt(nameColor.slice(1, 3), 16)}, ${parseInt(nameColor.slice(3, 5), 16)}, ${parseInt(nameColor.slice(5, 7), 16)}, ${opacity * 0.8})`
          
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
            showTutorial(requiredKit)
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
          // #region agent log
          debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H8',location:'SimpleGame.tsx:powerupRender',message:'quiz-item entering kit render',data:{type:kit.type,color:kit.color},timestamp:Date.now()})
          // #endregion
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
          // #region agent log
          debugIngest({sessionId:'debug-session',runId:'post-fix',hypothesisId:'H9',location:'SimpleGame.tsx:powerupRender',message:'overlay quiz text on icon',data:{type:kit.type,textLength:quizName.length},timestamp:Date.now()})
          // #endregion
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
      animationTime += animationSpeed
      
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
  
  const handleStart = () => {
    trackGameStart()
    resetGame()
    setGameStarted(true)
    setLevel(1)
  }
  
  const handleRestart = () => {
    resetGame()
    setSavedGameState(null)
    setShowQuiz(false)
    setGameStarted(true)
    setLevel(1)
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
        <TutorialOverlay 
          showing={tutorial.state.showing}
          onClose={tutorial.actions.close}
        />
        <StartScreen 
          onStart={handleStart}
          onShowTutorial={tutorial.actions.open}
        />
      </>
    )
  }
  
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* HUD - RESPONSIVE FOR MOBILE */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start text-white font-mono text-sm md:text-xl z-10 pointer-events-none">
        <div className="space-y-1 md:space-y-2">
          {/* Mobile only - level and score shown in canvas HUD on desktop */}
          <div className="md:hidden bg-black/80 border border-cyan-600 rounded px-2 py-1">
            <span className="text-[10px]">L:</span> <span className="text-cyan-400 font-bold text-sm">{level}</span>
          </div>
          <div className="md:hidden bg-black/80 border border-yellow-600 rounded px-2 py-1">
            <span className="text-[10px]">S:</span> <span className="text-yellow-400 font-bold text-sm">{score}</span>
          </div>
        </div>
        
        {/* Threat Direction Indicator - rendered in canvas HUD */}
        
        {/* Kit inventory displayed in canvas */}
      </div>
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        tabIndex={0}
      />

      {/* Feedback Button - During Gameplay */}
      <button
        onClick={() => {
          window.open('mailto:connect@knacksters.co?subject=Byte Runner Feedback&body=Hi! Here\'s my feedback about Byte Runner:%0D%0A%0D%0A', '_blank')
        }}
        className="absolute bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-semibold py-2 px-3 md:px-4 rounded-lg transition-all shadow-lg hover:scale-105 flex items-center gap-1 md:gap-2 z-10 pointer-events-auto"
        title="Send feedback"
      >
        📝 <span className="hidden md:inline">Feedback</span>
      </button>
      
      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 overflow-y-auto p-2 md:p-4">
          <div 
            className="text-center space-y-3 bg-[#0f1629] rounded-3xl p-4 md:p-5 max-w-xl w-full mx-auto my-auto max-h-[95vh] overflow-y-auto relative [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-red-500"
            style={{
              border: '4px solid',
              borderImage: 'linear-gradient(135deg, #ff4444, #ff6666, #00ffff, #0088ff) 1'
            }}
          >
            {/* Header - ELIMINATED with cyber styling */}
            <h2 className="text-4xl md:text-5xl font-black text-red-500 font-mono tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,68,68,0.8)]">ELIMINATED</h2>
            
            {/* Killer Info - Mockup Style */}
            {lastAttacker && lastThreatType && (
              <div className="border-2 border-red-500/60 bg-black/40 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <p className="text-white text-sm md:text-base font-mono">
                  <span className="text-lg mr-2">{lastAttacker.emoji}</span>
                  Killed by <span className="font-bold text-red-400">{lastAttacker.name}</span>
                  <span className={`ml-1 text-xs ${
                    lastAttacker.level >= 100 ? 'text-red-400' : 
                    lastAttacker.level >= 71 ? 'text-yellow-400' : 
                    'text-cyan-400'
                  }`}>
                    (Lv{lastAttacker.level} {lastAttacker.level >= 71 ? 'HIGH' : 'MID'})
                  </span>
                </p>
                <p className="text-yellow-300 text-xs md:text-sm mt-1.5 font-mono">
                  Using: {getThreatName(lastThreatType)}
                </p>
              </div>
            )}
            
            {/* Stats - Single Line Mockup Style */}
            <div className="text-white text-sm md:text-base font-mono tracking-wide">
              <span className="text-gray-400">Level:</span> <span className="text-cyan-400 font-extrabold">{level}</span> 
              <span className="text-gray-500 mx-2">•</span> 
              <span className="text-gray-400">Score:</span> <span className="text-yellow-400 font-extrabold">{score}</span>
            </div>
            
            {/* Educational moment - Mockup Style */}
            {lastThreatType && (() => {
              const protectionKit = getProtectionKitForThreat(lastThreatType)
              return protectionKit ? (
                <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 border-2 border-cyan-500/40 rounded-2xl overflow-hidden backdrop-blur-sm">
                  {/* Collapsed Header - Always Visible */}
                  <button
                    onClick={() => {
                      ui.actions.toggleEducationDetails()
                      const newState = !ui.state.showEducationDetails
                      // Track education expansion
                      if (newState && lastThreatType) {
                        const kit = getProtectionKitForThreat(lastThreatType)
                        if (kit) trackEducationExpanded(kit.id)
                      }
                      // Auto-award bonus kit when expanded for first time!
                      if (newState && !bonusKitType) {
                        setBonusKitType(protectionKit.id)
                        ui.actions.showBonus(3000)
                      }
                    }}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-cyan-900/20 transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">💡</span>
                      <div>
                        <p className="text-cyan-300 text-xs md:text-sm font-extrabold font-mono tracking-wide">
                          WHY YOU DIED
                          {isFirstDeath && !ui.state.showEducationDetails && (
                            <span className="ml-2 text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded animate-pulse font-bold">
                              TAP
                            </span>
                          )}
                        </p>
                        <p className="text-pink-300 text-xs mt-0.5 font-mono">
                          Missing {protectionKit.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg text-cyan-400 transition-transform duration-300 group-hover:scale-110" style={{ transform: ui.state.showEducationDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </span>
                  </button>
                  
                  {/* Expandable Content */}
                  {ui.state.showEducationDetails && (
                    <div className="px-3 pb-3 space-y-2 border-t border-cyan-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-red-300 text-xs pt-2 font-mono">
                        Hit by <span className="font-extrabold text-red-400">{getThreatName(lastThreatType)}</span> without protection.
                      </p>
                      
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="bg-black/30 rounded p-2">
                          <p className="text-cyan-300 font-extrabold mb-0.5 tracking-wide">WHAT IS IT?</p>
                          <p className="text-white leading-snug text-[11px]">
                            {protectionKit.whatItIs}
                          </p>
                        </div>
                        
                        <div className="bg-black/30 rounded p-2">
                          <p className="text-yellow-300 font-extrabold mb-0.5 tracking-wide">WHY IT MATTERS:</p>
                          <p className="text-gray-200 leading-snug text-[11px]">
                            {protectionKit.whyItMatters}
                          </p>
                        </div>
                        
                        <div className="bg-black/30 rounded p-2">
                          <p className="text-green-300 font-extrabold mb-0.5 tracking-wide">HOW TO GET IT:</p>
                          <ul className="text-gray-200 text-[11px] space-y-0.5 list-disc list-inside leading-snug">
                            {protectionKit.howToGetIt.slice(0, 2).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Learn More Button */}
                      <button
                        onClick={() => {
                          ui.actions.toggleLearnMore()
                          if (lastThreatType) {
                            const kit = getProtectionKitForThreat(lastThreatType)
                            if (kit) trackDeepDiveViewed(kit.id)
                          }
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold py-2 px-3 rounded-lg transition-all transform hover:scale-[1.02] text-xs font-mono tracking-wide"
                      >
                        🎓 LEARN MORE
                      </button>
                    </div>
                  )}
                  
                  {/* Bonus Kit Notification */}
                  {ui.state.showBonusNotification && bonusKitType === protectionKit.id && (
                    <div className="bg-green-600 text-white px-2 py-1.5 text-xs font-extrabold text-center border-t border-green-400 font-mono">
                      ✓ +1 {protectionKit.emoji} {protectionKit.name}
                    </div>
                  )}
                </div>
              ) : null
            })()}
            
            {/* Social Share Section - Mockup Style */}
            <div className="border-t border-gray-700/30 pt-3 pb-2">
              <p className="text-cyan-400 text-sm font-extrabold text-center mb-2 font-mono tracking-wide">Share Your Score:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {/* Twitter/X Share */}
                <button
                  onClick={() => {
                    trackSocialShare('twitter', score)
                    const text = `I scored ${score} on Byte Runner! 🎮🔐 Reached level ${level}. Can you beat me?\n\nPlay: ${window.location.origin}`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                  className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs md:text-sm font-bold py-2 px-4 rounded-xl transition-all font-mono"
                  title="Share on Twitter/X"
                >
                  𝕏 Share
                </button>

                {/* LinkedIn Share */}
                <button
                  onClick={() => {
                    trackSocialShare('linkedin', score)
                    const url = encodeURIComponent(window.location.origin);
                    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    window.open(linkedInUrl, '_blank');
                  }}
                  className="bg-[#0077B5] hover:bg-[#006399] text-white text-xs md:text-sm font-bold py-2 px-4 rounded-xl transition-all font-mono"
                  title="Share on LinkedIn"
                >
                  in Share
                </button>

                {/* Copy Link */}
                <button
                  onClick={(e) => {
                    navigator.clipboard.writeText(window.location.origin);
                    const btn = e.currentTarget as HTMLButtonElement;
                    if (btn) {
                      const originalText = btn.innerHTML;
                      btn.innerHTML = '✓ Copied!';
                      btn.classList.add('bg-green-600');
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('bg-green-600');
                      }, 2000);
                    }
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white text-xs md:text-sm font-bold py-2 px-4 rounded-xl transition-all font-mono"
                  title="Copy link"
                >
                  🔗 Copy
                </button>
              </div>
            </div>

            {/* ACTION CHOICE - Mockup Style */}
            <div className="space-y-2.5 pt-3 border-t border-gray-700/30">
              <p className="text-center text-cyan-300 font-extrabold text-sm md:text-base font-mono tracking-widest">
                ⚡ CHOOSE YOUR FATE ⚡
              </p>
              
              {/* Option Cards */}
              <div className="space-y-2.5">
                {/* Option 1: Restart */}
                <button
                  onClick={() => setDeathAction('restart')}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border-3 font-mono ${
                    deathAction === 'restart' 
                      ? 'bg-cyan-900/30 border-cyan-400 shadow-lg shadow-cyan-500/30 border-[3px]' 
                      : 'bg-black/30 border-cyan-700/40 hover:border-cyan-600/60 border-2'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl mt-0.5">🔄</div>
                    <div className="flex-1">
                      <h3 className="text-cyan-400 font-extrabold text-sm tracking-wide">RESTART FROM LEVEL 1</h3>
                      <p className="text-gray-300 text-xs mt-1">
                        Start fresh • Instant restart{bonusKitType && ' • +1 BONUS KIT! 🎁'}
                      </p>
                    </div>
                    {deathAction === 'restart' && (
                      <div className="text-cyan-400 text-2xl font-bold">✓</div>
                    )}
                  </div>
                </button>
                
                {/* Option 2: Quiz */}
                <button
                  onClick={() => setDeathAction('quiz')}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all font-mono ${
                    deathAction === 'quiz' 
                      ? 'bg-purple-900/30 border-purple-400 shadow-lg shadow-purple-500/30 border-[3px]' 
                      : 'bg-black/30 border-purple-700/40 hover:border-purple-600/60 border-2'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl mt-0.5">🧠</div>
                    <div className="flex-1">
                      <h3 className="text-purple-400 font-extrabold text-sm tracking-wide">ANSWER QUIZ TO CONTINUE</h3>
                      <p className="text-gray-300 text-xs mt-1">
                        <span className="text-green-400 font-bold">✓ Pass:</span> Continue Level {level} • 
                        <span className="text-red-400 font-bold"> ✗ Fail:</span> Restart w/ 50% kits
                      </p>
                      <p className="text-yellow-300 text-[10px] mt-1 font-bold">⏱️ 30s quiz • Multiple choice</p>
                    </div>
                    {deathAction === 'quiz' && (
                      <div className="text-purple-400 text-2xl font-bold">✓</div>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Action Button - Large and Prominent */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (deathAction === 'restart') {
                      handleRestart()
                    } else {
                      if (lastThreatType) {
                        const kit = getProtectionKitForThreat(lastThreatType)
                        if (kit) trackQuizAttempt(kit.id)
                      }
                      setShowQuiz(true)
                    }
                  }}
                  className={`w-full font-black py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] text-base md:text-lg shadow-xl font-mono tracking-widest ${
                    deathAction === 'restart'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/40'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-purple-500/40'
                  }`}
                >
                  {deathAction === 'restart' ? 'RESTART' : 'ANSWER QUIZ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Knowledge Card Modal - Deep Learning */}
      {ui.state.showLearnMore && lastThreatType && (() => {
        const protectionKit = getProtectionKitForThreat(lastThreatType)
        return protectionKit ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-30 overflow-y-auto p-4">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 border-4 border-purple-500 rounded-2xl p-8 max-w-4xl w-full mx-auto my-auto max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-purple-500">
              {/* Header */}
              <div className="text-center mb-6 border-b border-purple-500 pb-4">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                  {protectionKit.emoji} {protectionKit.name}
                </h2>
                <p className="text-gray-300 text-lg italic">{protectionKit.description}</p>
              </div>
              
              {/* How It Works */}
              <div className="mb-6 bg-blue-950/50 border border-blue-500 rounded-lg p-5">
                <h3 className="text-2xl font-bold text-cyan-400 mb-3">🔧 How It Works</h3>
                <p className="text-white text-base leading-relaxed">{protectionKit.howItWorks}</p>
              </div>
              
              {/* Real World Example */}
              <div className="mb-6 bg-red-950/50 border border-red-500 rounded-lg p-5">
                <h3 className="text-2xl font-bold text-red-400 mb-3">📰 Real World Breach</h3>
                <p className="text-yellow-300 text-lg font-bold mb-2">{protectionKit.realWorldExample.title}</p>
                <p className="text-white text-base leading-relaxed mb-3">{protectionKit.realWorldExample.description}</p>
                <p className="text-red-300 text-base leading-relaxed">
                  <span className="font-bold">Impact:</span> {protectionKit.realWorldExample.impact}
                </p>
              </div>
              
              {/* Step-by-Step Setup */}
              <div className="mb-6 bg-green-950/50 border border-green-500 rounded-lg p-5">
                <h3 className="text-2xl font-bold text-green-400 mb-4">📋 Step-by-Step Setup</h3>
                {protectionKit.stepByStepSetup.map((setup, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <p className="text-cyan-300 font-bold text-lg mb-2">{setup.platform}:</p>
                    <ol className="list-decimal list-inside text-white text-sm space-y-1 ml-2">
                      {setup.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              
              {/* Key Learning Points */}
              <div className="mb-6 bg-yellow-950/50 border border-yellow-500 rounded-lg p-5">
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">💡 Key Takeaways</h3>
                <ul className="text-white text-base space-y-2">
                  {protectionKit.learningPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-yellow-400 mr-2">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Reward Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center animate-pulse">
                <p className="text-yellow-300 text-2xl font-bold">🎁 REWARD UNLOCKED!</p>
                <p className="text-white text-lg">You'll start your next game with +1 {protectionKit.name}!</p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  // Award bonus kit matching the protection kit they learned about
                  const protectionKit = getProtectionKitForThreat(lastThreatType)
                  if (protectionKit) {
                    setBonusKitType(protectionKit.id)
                  }
                  ui.actions.toggleLearnMore()
                }}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-2xl font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
              >
                ✓ GOT IT! CLOSE & RESTART
              </button>
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
          onPass={handleQuizPass}
          onFail={handleQuizFail}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  )
}
