'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'
import { getRandomThreat, getThreatName, getQuickTip, type ThreatType, type ThreatCategory } from '@/lib/game/threatData'
import { getRandomGhostPlayer, type GhostPlayer } from '@/lib/game/ghostPlayers'
import { getProtectionKitName, getProtectionKitForThreat, getProtectionKitById, type ProtectionKit } from '@/lib/game/protectionKits'
import { getCurrentZone, isZoneTransition, getZoneTip, getThreatSpawnWeight } from '@/lib/game/zones'
import { trackGameStart, trackGameOver, trackLevelUp, trackKitCollected, trackQuizAttempt, trackQuizPass, trackQuizFail, trackTutorialViewed, trackTutorialDismissed, trackSocialShare, trackEducationExpanded, trackDeepDiveViewed } from '@/lib/analytics'
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
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [bonusKitType, setBonusKitType] = useState<string | null>(null)
  const [showBonusNotification, setShowBonusNotification] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [savedGameState, setSavedGameState] = useState<{level: number, kits: {[key:string]:number}, score: number} | null>(null)
  const [showEducationDetails, setShowEducationDetails] = useState(false)
  const [isFirstDeath, setIsFirstDeath] = useState(true)
  const [deathAction, setDeathAction] = useState<'restart' | 'quiz'>('restart')
  const [mobileHudExpanded, setMobileHudExpanded] = useState(false)
  const mobileHudCollapseTimer = useRef<number | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialCountdown, setTutorialCountdown] = useState(5)
  const tutorialStartTime = useRef<number>(0)
  const { distance, score, isGameOver, lastAttacker, lastThreatType, setDistance, addScore, setGameOver, setRunning, setLastAttacker, resetGame } = useGameStore()
  
  // Countdown timer for tutorial (only when manually opened)
  useEffect(() => {
    if (showTutorial && tutorialCountdown > 0) {
      const timer = setTimeout(() => {
        setTutorialCountdown(tutorialCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showTutorial, tutorialCountdown])
  
  const closeTutorial = () => {
    const timeSpent = Date.now() - tutorialStartTime.current
    trackTutorialDismissed(timeSpent)
    setShowTutorial(false)
    setTutorialCountdown(5)
  }
  
  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
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
        setTimeout(() => setIsLoading(false), 2000) // 2 second delay for dramatic effect
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
  }, [isMounted])
  
  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
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
    let obstacleSpeed = 3
    let powerupsNeeded = 0
    let powerupsCollected = 0
    let isAdvancingLevel = false // Prevent multiple level advances
    let spawnFrequency = 800 // ms between obstacle spawns
    
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
    
    // Kit inventory system - ALL 8 REAL protection kits!
    // Restore from saved state if continuing from quiz pass
    let kitInventory = savedGameState ? {
      ...savedGameState.kits
    } : {
      'password-manager': bonusKitType === 'password-manager' ? 1 : 0,
      'link-analyzer': bonusKitType === 'link-analyzer' ? 1 : 0,
      'patch-manager': bonusKitType === 'patch-manager' ? 1 : 0,
      'privacy-optimizer': bonusKitType === 'privacy-optimizer' ? 1 : 0,
      'vpn-shield': bonusKitType === 'vpn-shield' ? 1 : 0,
      'mfa-authenticator': bonusKitType === 'mfa-authenticator' ? 1 : 0,
      'backup-system': bonusKitType === 'backup-system' ? 1 : 0,
      'social-engineering-defense': bonusKitType === 'social-engineering-defense' ? 1 : 0
    }
    const MAX_KIT_CAPACITY = 3
    
    // Show bonus notification and clear bonus after applying it
    if (bonusKitType) {
      setShowBonusNotification(true)
      setTimeout(() => setShowBonusNotification(false), 5000) // Show for 5 seconds
      setTimeout(() => setBonusKitType(null), 100) // Clear after a brief delay
    }
    
    // Tutorial overlay state
    let showingTutorial = false
    let tutorialKit = ''
    let tutorialTimer = 0
    const TUTORIAL_DURATION = 7000 // 7 seconds - longer for reading
    
    // Healing state - player frozen during tutorial
    let isHealing = false
    
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
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1 + 0.5
      })
    }
    
    // Create matrix columns (for level 10+)
    for (let i = 0; i < 50; i++) {
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
        const hudX = canvas.width - (mobileHudExpanded ? 130 : 110)
        const hudY = 80
        const hudWidth = mobileHudExpanded ? 130 : 100
        const hudHeight = mobileHudExpanded ? 210 : 80
        
        // Check if touch is within HUD bounds
        if (
          touch.clientX >= hudX && 
          touch.clientX <= hudX + hudWidth &&
          touch.clientY >= hudY && 
          touch.clientY <= hudY + hudHeight
        ) {
          // Toggle HUD
          setMobileHudExpanded(!mobileHudExpanded)
          
          // Clear existing timer
          if (mobileHudCollapseTimer.current) {
            clearTimeout(mobileHudCollapseTimer.current)
          }
          
          // Auto-collapse after 3 seconds if expanded
          if (!mobileHudExpanded) {
            mobileHudCollapseTimer.current = window.setTimeout(() => {
              setMobileHudExpanded(false)
            }, 3000)
          }
          
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
      if (canvas.width < 768) { // Mobile viewport
        const rect = canvas.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top
        
        const hudX = canvas.width - (mobileHudExpanded ? 130 : 110)
        const hudY = 80
        const hudWidth = mobileHudExpanded ? 130 : 100
        const hudHeight = mobileHudExpanded ? 210 : 80
        
        // Check if click is within HUD bounds
        if (
          clickX >= hudX && 
          clickX <= hudX + hudWidth &&
          clickY >= hudY && 
          clickY <= hudY + hudHeight
        ) {
          // Toggle HUD
          setMobileHudExpanded(!mobileHudExpanded)
          
          // Clear existing timer
          if (mobileHudCollapseTimer.current) {
            clearTimeout(mobileHudCollapseTimer.current)
          }
          
          // Auto-collapse after 3 seconds if expanded
          if (!mobileHudExpanded) {
            mobileHudCollapseTimer.current = window.setTimeout(() => {
              setMobileHudExpanded(false)
            }, 3000)
          }
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
    
    // Kit spawning function - ALL 8 TYPES
    function spawnKit() {
      const kitTypes = [
        'password-manager', 
        'link-analyzer', 
        'patch-manager', 
        'privacy-optimizer', 
        'vpn-shield',
        'mfa-authenticator',
        'backup-system',
        'social-engineering-defense'
      ] as const
      const kitType = kitTypes[Math.floor(Math.random() * kitTypes.length)]
      
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
    
    // Map threats to their required protection kit - ALL 8 KITS
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
        'evil-twin': 'vpn-shield',
        'credential-stuffing': 'mfa-authenticator',
        'session-hijacking': 'mfa-authenticator',
        'ransomware': 'backup-system',
        'hardware-failure': 'backup-system',
        'pretexting': 'social-engineering-defense',
        'baiting-attack': 'social-engineering-defense'
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
    
    // Calculate kits needed for next level (based on 8 kit types)
    // Level 1→2: 8 kits (1 of each type)
    // Level 2→3: 16 kits total (2 of each type)
    // Level 3→4: 24 kits total (3 of each type)
    function calculateKitsNeededForNextLevel(level: number): number {
      return level * 8
    }
    
    // Draw tutorial overlay (healing process - freezes player)
    function drawTutorialOverlay() {
      if (!showingTutorial || tutorialTimer <= 0) {
        showingTutorial = false
        isHealing = false // End healing - player can move again
        return
      }
      
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
    
    // Get rank based on total kits collected
    function getRank() {
      if (totalKitsCollected < 10) return 'Newbie'
      if (totalKitsCollected < 30) return 'Analyst'
      if (totalKitsCollected < 60) return 'Expert'
      return 'Commando'
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
      
      // Reset flag after a short delay
      setTimeout(() => {
        isAdvancingLevel = false
      }, 1000)
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
    
    // Draw animated cyber background with color progression
    function drawBackground() {
      const colorScheme = getBackgroundColorScheme(currentLevel)
      
      // Dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, colorScheme.gradient1)
      gradient.addColorStop(0.5, colorScheme.gradient2)
      gradient.addColorStop(1, colorScheme.gradient1)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Animated grid lines
      ctx.strokeStyle = colorScheme.gridColor
      ctx.lineWidth = 1
      
      // Horizontal lines
      for (let i = 0; i < 30; i++) {
        const y = i * 50
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      // Vertical lines (animated)
      for (let i = 0; i < 50; i++) {
        const x = ((i * 50 + bgOffset) % (canvas.width + 100)) - 100
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      // Moving particles
      particles.forEach(particle => {
        particle.y += particle.speed
        if (particle.y > canvas.height) {
          particle.y = 0
          particle.x = Math.random() * canvas.width
        }
        
        ctx.fillStyle = colorScheme.particleColor
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
      
      // MATRIX RAIN for level 15+ (advanced cloud zone)
      if (currentLevel >= 15) {
        matrixColumns.forEach(col => {
          col.y += col.speed
          if (col.y > canvas.height) {
            col.y = -20
            col.x = Math.random() * canvas.width
          }
          
          const char = col.chars[Math.floor(Math.random() * col.chars.length)]
          ctx.fillStyle = '#00ff0088' // Green matrix text
          ctx.font = '14px monospace'
          ctx.fillText(char, col.x, col.y)
        })
      }
      
      // ZONE-SPECIFIC ENVIRONMENTAL ELEMENTS (ambient icons)
      const zone = getCurrentZone(currentLevel)
      const iconOpacity = Math.sin(Date.now() / 2000) * 0.1 + 0.15
      ctx.globalAlpha = iconOpacity
      ctx.font = '24px monospace'
      
      // Spawn zone icons in grid pattern
      for (let i = 0; i < 8; i++) {
        const element = zone.environmentalElements[Math.floor(Math.random() * zone.environmentalElements.length)]
        if (Math.random() < element.frequency) {
          const x = (i % 4) * (canvas.width / 4) + Math.random() * 100
          const y = Math.floor(i / 4) * (canvas.height / 2) + Math.random() * 100
          ctx.fillStyle = colorScheme.particleColor
          ctx.fillText(element.content, x, y)
        }
      }
      
      ctx.globalAlpha = 1.0
      
      // Update offset for animation
      bgOffset += obstacleSpeed
      if (bgOffset > 50) bgOffset = 0
    }
    
    // Game loop
    function gameLoop(timestamp: number) {
      if (!ctx) return
      
      // Draw animated background
      drawBackground()
      
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
        
        if (!mobileHudExpanded) {
          // COLLAPSED STATE - Minimal HUD
          const hudWidth = 100
          const hudHeight = 80
          
          // Semi-transparent background with pulse effect
          const pulse = Math.sin(Date.now() / 1000) * 0.1 + 0.85
          ctx.fillStyle = `rgba(0, 0, 0, ${pulse})`
          ctx.fillRect(kitX, kitY, hudWidth, hudHeight)
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 2
          ctx.strokeRect(kitX, kitY, hudWidth, hudHeight)
          
          // Level and rank
          ctx.font = 'bold 13px monospace'
          ctx.fillStyle = '#ffd700'
          ctx.textAlign = 'left'
          const rank = getRank()
          ctx.fillText(`L${currentLevel}`, kitX + 8, kitY + 20)
          ctx.font = '9px monospace'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(rank, kitX + 8, kitY + 32)
          
          // Total kit count (non-zero)
          const totalKitsInInventory = 
            (kitInventory['password-manager'] || 0) + 
            (kitInventory['link-analyzer'] || 0) + 
            (kitInventory['patch-manager'] || 0) + 
            (kitInventory['privacy-optimizer'] || 0) + 
            (kitInventory['vpn-shield'] || 0) +
            (kitInventory['mfa-authenticator'] || 0) +
            (kitInventory['backup-system'] || 0) +
            (kitInventory['social-engineering-defense'] || 0)
          
          ctx.font = 'bold 18px monospace'
          ctx.fillStyle = totalKitsInInventory > 0 ? '#00ff00' : '#ff6666'
          ctx.fillText(`🛡️${totalKitsInInventory}`, kitX + 8, kitY + 55)
          
          // Expand indicator (animated)
          ctx.font = 'bold 10px monospace'
          ctx.fillStyle = '#00ffff'
          const expandY = kitY + 70 + Math.sin(Date.now() / 300) * 2
          ctx.fillText('TAP ▼', kitX + 28, expandY)
          
        } else {
          // EXPANDED STATE - Full HUD
          const hudWidth = 130
          const hudHeight = 210
          
          // Semi-transparent background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
          ctx.fillRect(kitX - 20, kitY, hudWidth, hudHeight)
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.strokeRect(kitX - 20, kitY, hudWidth, hudHeight)
          
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
          ctx.font = '15px monospace'
          const kits = [
            { emoji: '🔐', count: kitInventory['password-manager'] },
            { emoji: '🔗', count: kitInventory['link-analyzer'] },
            { emoji: '🛡️', count: kitInventory['patch-manager'] },
            { emoji: '🕵️', count: kitInventory['privacy-optimizer'] },
            { emoji: '🔒', count: kitInventory['vpn-shield'] },
            { emoji: '🔑', count: kitInventory['mfa-authenticator'] },
            { emoji: '💾', count: kitInventory['backup-system'] },
            { emoji: '🎭', count: kitInventory['social-engineering-defense'] }
          ]
          
          // Draw in compact grid
          for (let i = 0; i < kits.length; i++) {
            const col = i % 2
            const row = Math.floor(i / 2)
            const x = kitX - 10 + (col * 60)
            const y = kitY + 65 + (row * 18)
            
            const kit = kits[i]
            const count = kit.count || 0
            ctx.fillStyle = count > 0 ? '#ffffff' : '#555555'
            ctx.fillText(`${kit.emoji}${count}`, x, y)
          }
          
          // Zone icon
          const currentZone = getCurrentZone(currentLevel)
          ctx.font = '18px monospace'
          ctx.fillStyle = currentZone.colorScheme.accent
          ctx.fillText(currentZone.icon, kitX + 35, kitY + 195)
          
          // Collapse indicator
          ctx.font = 'bold 10px monospace'
          ctx.fillStyle = '#00ffff'
          ctx.fillText('TAP ▲', kitX + 28, kitY + 195)
        }
        
      } else {
        // DESKTOP: Full detailed HUD
        const kitX = canvas.width - 280
        const kitY = 120
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(kitX, kitY, 260, 380)
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 2
        ctx.strokeRect(kitX, kitY, 260, 380)
        
        // Level and rank header
        ctx.font = 'bold 16px monospace'
        ctx.fillStyle = '#ffd700'
        ctx.textAlign = 'left'
        const rank = getRank()
        ctx.fillText(`Level ${currentLevel} | ${rank}`, kitX + 10, kitY + 25)
        
        // Kit progress bar
        const kitsNeeded = calculateKitsNeededForNextLevel(currentLevel)
        const progressPercent = Math.min(totalKitsCollected / kitsNeeded, 1)
        ctx.font = '14px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(`Progress: ${totalKitsCollected}/${kitsNeeded} kits`, kitX + 10, kitY + 50)
        
        // Progress bar
        const barWidth = 240
        const barHeight = 12
        ctx.fillStyle = '#333333'
        ctx.fillRect(kitX + 10, kitY + 60, barWidth, barHeight)
        ctx.fillStyle = '#00ff00'
        ctx.fillRect(kitX + 10, kitY + 60, barWidth * progressPercent, barHeight)
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 1
        ctx.strokeRect(kitX + 10, kitY + 60, barWidth, barHeight)
        
        // Kit inventory section - ALL 8 KITS!
        ctx.font = 'bold 16px monospace'
        ctx.fillStyle = '#00ffff'
        ctx.fillText('PROTECTION KITS', kitX + 10, kitY + 95)
        
        ctx.font = '11px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(`🔐 Password: ${kitInventory['password-manager']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 120)
        ctx.fillText(`🔗 Link: ${kitInventory['link-analyzer']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 138)
        ctx.fillText(`🛡️ Patch: ${kitInventory['patch-manager']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 156)
        ctx.fillText(`🕵️ Privacy: ${kitInventory['privacy-optimizer']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 174)
        ctx.fillText(`🔒 VPN: ${kitInventory['vpn-shield']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 192)
        ctx.fillText(`🔑 MFA: ${kitInventory['mfa-authenticator']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 210)
        ctx.fillText(`💾 Backup: ${kitInventory['backup-system']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 228)
        ctx.fillText(`🎭 Social: ${kitInventory['social-engineering-defense']}/${MAX_KIT_CAPACITY}`, kitX + 10, kitY + 246)
        
        // Zone indicator and contextual tip
        const currentZone = getCurrentZone(currentLevel)
        ctx.font = 'bold 14px monospace'
        ctx.fillStyle = currentZone.colorScheme.accent
        ctx.fillText(`ZONE: ${currentZone.icon}`, kitX + 10, kitY + 275)
        
        // Rotating zone tip (changes every 5 seconds)
        const tipIndex = Math.floor(Date.now() / 5000) % currentZone.contextualTips.length
        const zoneTip = currentZone.contextualTips[tipIndex]
        ctx.font = '10px monospace'
        ctx.fillStyle = '#ffff00'
        // Word wrap the tip
        const maxWidth = 240
        const words = zoneTip.split(' ')
        let line = ''
        let y = kitY + 293
        words.forEach(word => {
          const testLine = line + word + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, kitX + 10, y)
            line = word + ' '
            y += 12
          } else {
            line = testLine
          }
        })
        ctx.fillText(line, kitX + 10, y)
      }
      
      // Spawn obstacles continuously (frequency increases with level)
      if (timestamp - lastSpawn > spawnFrequency) {
        spawnObstacle()
        lastSpawn = timestamp
      }
      
      // Spawn kits periodically
      if (timestamp % 5000 < 50) { // Approximately every 5 seconds
        spawnKit()
      }
      
      // Update game time
      gameTime += 16 // Approximately 16ms per frame at 60fps
      
      // Update and draw obstacles
      obstacles = obstacles.filter(obstacle => {
        obstacle.y += obstacle.vy
        obstacle.x += obstacle.vx
        
        // Bounce off edges for boss attacks (creates zigzag pattern)
        if (obstacle.type === 'boss-attack') {
          if (obstacle.x < 50 || obstacle.x > canvas.width - 50) {
            obstacle.vx = -obstacle.vx // Reverse horizontal direction
          }
        }
        
        // Culling: only draw if visible on screen
        const isVisible = obstacle.y > -100 && obstacle.y < canvas.height + 100
        
        if (isVisible) {
          ctx.shadowBlur = 15
          ctx.shadowColor = obstacle.color
          
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
        
        // Show ghost player name for first 2 seconds (2000ms)
        const timeSinceSpawn = gameTime - (obstacle.spawnTime || 0)
        if (timeSinceSpawn < 2000 && obstacle.sentBy && obstacle.type !== 'boss-attack') {
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
          
          ctx.font = `bold ${fontSize}px monospace`
          ctx.fillStyle = `rgba(${parseInt(nameColor.slice(1, 3), 16)}, ${parseInt(nameColor.slice(3, 5), 16)}, ${parseInt(nameColor.slice(5, 7), 16)}, ${opacity})`
          ctx.textAlign = 'center'
          ctx.shadowBlur = 8
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
        
        // Check collision with obstacles
        if (checkCollision(
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
            addScore(25) // Bonus for surviving with kit
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
              addScore(100) // Higher reward for having backup!
              
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
        // Draw kit with pulsing glow
        const pulse = Math.sin(timestamp * 0.005) * 0.3 + 0.7
        const size = 35 * pulse
        
        ctx.shadowBlur = 30 * pulse
        ctx.shadowColor = kit.color
        
        // Kit icon based on type - ALL 8 KITS
        let icon = '🔐' // password-manager
        if (kit.type.includes('link-analyzer')) icon = '🔗'
        else if (kit.type.includes('patch-manager')) icon = '🛡️'
        else if (kit.type.includes('privacy-optimizer')) icon = '🕵️'
        else if (kit.type.includes('vpn-shield')) icon = '🔒'
        else if (kit.type.includes('mfa-authenticator')) icon = '🔑'
        else if (kit.type.includes('backup-system')) icon = '💾'
        else if (kit.type.includes('social-engineering-defense')) icon = '🎭'
        
        // Draw kit box
        ctx.fillStyle = kit.color + '88'
        ctx.fillRect(kit.x - size / 2, kit.y - size / 2, size, size)
        
        ctx.strokeStyle = kit.color
        ctx.lineWidth = 3
        ctx.strokeRect(kit.x - size / 2, kit.y - size / 2, size, size)
        
        // Draw icon
        ctx.font = 'bold 24px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(icon, kit.x, kit.y + 8)
        ctx.textAlign = 'left'
        
        ctx.shadowBlur = 0
        
        // Check collision
        if (checkCollision(
          { x: playerX - playerSize / 2, y: playerY - playerSize / 2, width: playerSize, height: playerSize },
          { x: kit.x - size / 2, y: kit.y - size / 2, width: size, height: size }
        )) {
          // Determine kit type
          const kitType = kit.type.replace('kit-', '') as keyof typeof kitInventory
          
          // Add to inventory if not full
          if (kitType && kitInventory[kitType] !== undefined && kitInventory[kitType] < MAX_KIT_CAPACITY) {
            kitInventory[kitType]++
            totalKitsCollected++
            addScore(50)
            
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
      // Dynamic glow based on kits collected - ALL 8 KITS
      const totalKitsInInventory = 
        (kitInventory['password-manager'] || 0) + 
        (kitInventory['link-analyzer'] || 0) + 
        (kitInventory['patch-manager'] || 0) + 
        (kitInventory['privacy-optimizer'] || 0) + 
        (kitInventory['vpn-shield'] || 0) +
        (kitInventory['mfa-authenticator'] || 0) +
        (kitInventory['backup-system'] || 0) +
        (kitInventory['social-engineering-defense'] || 0)
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
      ctx.shadowBlur = glowSize
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
      // Clean up HUD collapse timer
      if (mobileHudCollapseTimer.current) {
        clearTimeout(mobileHudCollapseTimer.current)
      }
    }
  }, [gameStarted, isGameOver, setDistance, addScore, setGameOver, setRunning, setLastAttacker, resetGame, setLevel, mobileHudExpanded])
  
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
    setTimeout(() => setSavedGameState(null), 100)
  }
  
  const handleQuizFail = () => {
    // Track quiz fail
    if (lastThreatType) {
      const kit = getProtectionKitForThreat(lastThreatType)
      if (kit) trackQuizFail(kit.id)
    }
    // Restart but keep 50% of kits (rounded down) - ALL 8 TYPES
    setShowQuiz(false)
    
    if (savedGameState) {
      // Calculate 50% of each kit type
      const partialKits = {
        'password-manager': Math.floor(savedGameState.kits['password-manager'] / 2),
        'link-analyzer': Math.floor(savedGameState.kits['link-analyzer'] / 2),
        'patch-manager': Math.floor(savedGameState.kits['patch-manager'] / 2),
        'privacy-optimizer': Math.floor(savedGameState.kits['privacy-optimizer'] / 2),
        'vpn-shield': Math.floor(savedGameState.kits['vpn-shield'] / 2),
        'mfa-authenticator': Math.floor(savedGameState.kits['mfa-authenticator'] / 2),
        'backup-system': Math.floor(savedGameState.kits['backup-system'] / 2),
        'social-engineering-defense': Math.floor(savedGameState.kits['social-engineering-defense'] / 2)
      }
      
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
    setTimeout(() => setSavedGameState(null), 100)
  }
  
  // Show nothing during SSR to prevent hydration errors
  if (!isMounted) {
    return null
  }
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden" style={{ zIndex: 10 }}>
        {/* Semi-transparent overlay to see background through */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="relative z-10 text-center space-y-6 px-4">
          {/* Logo with glow effect */}
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="Byte Runner Logo" 
              className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-[0_0_40px_rgba(0,255,255,0.8)] animate-pulse"
              style={{ 
                filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.6))'
              }}
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 font-mono">
            INITIALIZING CYBERSPACE...
          </h2>

          {/* Progress bar */}
          <div className="w-64 md:w-96 mx-auto">
            <div className="h-3 bg-gray-900 rounded-full overflow-hidden border-2 border-cyan-700 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                style={{ 
                  width: `${loadProgress}%`,
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
            <p className="text-cyan-300 text-sm md:text-base font-mono mt-2">
              {Math.round(loadProgress)}% • Loading assets...
            </p>
          </div>

          {/* Loading dots animation */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    )
  }
  
  if (!gameStarted) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-y-auto py-4" style={{ zIndex: 10 }}>
        {/* Tutorial Overlay - Compact Version */}
        {showTutorial && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black z-50 p-4 overflow-y-auto"
            onClick={closeTutorial}
          >
            <div 
              className="bg-gradient-to-br from-gray-900 to-blue-900 border-2 border-cyan-500 rounded-lg p-3 md:p-4 max-w-2xl w-full max-h-[75vh] overflow-y-auto relative animate-in fade-in slide-in-from-top-2 duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeTutorial}
                className="absolute top-1 right-1 text-gray-400 hover:text-white text-lg font-bold transition-colors z-10"
                aria-label="Close tutorial"
              >
                ✕
              </button>

              {/* Header */}
              <div className="text-center mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
                  🎮 HOW TO PLAY
                </h2>
              </div>

              {/* Content - Compact Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white text-xs">
                {/* Objective */}
                <div className="bg-black/50 border-2 border-cyan-600 rounded-lg p-2">
                  <h3 className="text-cyan-400 font-bold text-sm mb-1">🎯 Objective</h3>
                  <p className="text-gray-300 text-xs leading-tight">
                    Collect <strong className="text-green-400">kits</strong>, survive threats. 
                    Hit without kit = <strong className="text-red-400">game over!</strong>
                  </p>
                </div>

                {/* Controls */}
                <div className="bg-black/50 border-2 border-purple-600 rounded-lg p-2">
                  <h3 className="text-purple-400 font-bold text-sm mb-1">🕹️ Controls</h3>
                  <div className="text-xs text-gray-300 space-y-1">
                    <p>💻 <kbd className="bg-gray-800 px-1 py-0.5 rounded text-xs">WASD</kbd> or arrows</p>
                    <p>📱 Touch & drag</p>
                  </div>
                </div>

                {/* Key Mechanics - Full Width */}
                <div className="bg-black/50 border-2 border-yellow-600 rounded-lg p-2 md:col-span-2">
                  <h3 className="text-yellow-400 font-bold text-sm mb-1">⚡ Key Mechanics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 text-xs text-gray-300">
                    <div>🔐 8 Kits</div>
                    <div>🦠 15 Threats</div>
                    <div>📈 4 Zones</div>
                    <div>🧠 Quiz</div>
                    <div>💾 Backup = Life</div>
                    <div>📚 Real Tools</div>
                  </div>
                </div>
              </div>

              {/* Educational Note - Compact */}
              <div className="text-center text-xs text-gray-400 italic mt-2 pt-2 border-t border-gray-700">
                Learn real cybersecurity. Each death teaches defense tools.
              </div>

              {/* Legal Links */}
              <div className="flex justify-center gap-2 mt-2 text-xs flex-wrap">
                <a 
                  href="/privacy" 
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                >
                  Privacy
                </a>
                <span className="text-gray-600">•</span>
                <a 
                  href="/terms" 
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                >
                  Terms
                </a>
                <span className="text-gray-600">•</span>
                <a 
                  href="/faq" 
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                >
                  FAQ
                </a>
              </div>

              {/* Hint text */}
              <p className="text-center text-xs text-gray-500 mt-2 italic">
                Click outside or X to close
              </p>
            </div>
          </div>
        )}

        {/* Help Button (top-right corner for better mobile access) */}
        <button
          onClick={() => {
            setShowTutorial(true)
            tutorialStartTime.current = Date.now()
            setTutorialCountdown(5)
            trackTutorialViewed()
          }}
          className="absolute top-4 right-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl z-20 text-xl md:text-2xl"
          title="Show tutorial"
        >
          ?
        </button>

        <div className="text-center space-y-4 max-w-2xl px-4 my-auto">
          {/* Logo - now the main header */}
          <img 
            src="/logo.png" 
            alt="Byte Runner Logo" 
            className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(0,255,255,0.8)] hover:scale-105 transition-transform duration-300"
          />
          
          <p className="text-red-500 text-lg md:text-xl font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">The cyber storm is here - fortify or fall!</p>
          
          <div className="bg-black/80 border-2 border-cyan-600 rounded-lg p-4 md:p-6 text-white space-y-2 backdrop-blur-sm">
            <h3 className="text-cyan-400 font-bold text-lg md:text-xl mb-2">HOW TO PLAY:</h3>
            
            <div className="text-left space-y-1 text-sm md:text-base">
              <p><strong className="text-yellow-400">COLLECT KITS:</strong> Grab protection kits (🔐 🛡️ 🦠)</p>
              <p><strong className="text-green-400">SURVIVE:</strong> Use kits when hit by threats</p>
              <p><strong className="text-red-400">NO KIT = GAME OVER:</strong> Stay stocked!</p>
            </div>
            
            <div className="border-t-2 border-cyan-800 pt-2 mt-2">
              <h4 className="text-cyan-400 font-bold mb-1">CONTROLS:</h4>
              <div className="grid grid-cols-2 gap-1 text-left text-xs">
                <p>💻 <strong>WASD/Arrows</strong></p>
                <p>📱 <strong>Touch & Drag</strong></p>
              </div>
            </div>
            
            <div className="border-t-2 border-cyan-800 pt-2 mt-2">
              <h4 className="text-green-400 font-bold mb-1 text-sm">8 KITS • 4 ZONES • 15 THREATS</h4>
              <p className="text-yellow-400 text-xs">💡 Learn real cybersecurity while playing!</p>
              <p className="text-green-400 text-xs">💾 Backup Kit = Extra Life!</p>
            </div>
          </div>
          
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xl md:text-2xl font-bold py-4 md:py-5 px-12 md:px-14 rounded-xl transition-transform transform hover:scale-105 shadow-2xl animate-pulse mt-2 cursor-pointer relative"
            style={{ zIndex: 100 }}
          >
            🎮 START GAME
          </button>
        </div>

        {/* Feedback Button - Floating (bottom-left for mobile thumb access) */}
        <button
          onClick={() => {
            window.open('mailto:connect@knacksters.co?subject=Byte Runner Feedback&body=Hi! Here\'s my feedback about Byte Runner:%0D%0A%0D%0A', '_blank')
          }}
          className="absolute bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base font-semibold py-3 px-4 md:px-5 rounded-full md:rounded-lg transition-all shadow-xl hover:scale-105 flex items-center gap-2 z-20"
          title="Send feedback"
        >
          <span className="text-lg md:text-base">📝</span>
          <span className="hidden md:inline">Feedback</span>
        </button>
      </div>
    )
  }
  
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* HUD - RESPONSIVE FOR MOBILE */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start text-white font-mono text-sm md:text-xl z-10 pointer-events-none">
        <div className="space-y-1 md:space-y-2">
          <div className="bg-black/80 border border-cyan-600 md:border-2 rounded px-2 py-1 md:px-6 md:py-3">
            <span className="text-[10px] md:text-base">L:</span> <span className="text-cyan-400 font-bold text-sm md:text-xl">{level}</span>
          </div>
          <div className="bg-black/80 border border-yellow-600 md:border-2 rounded px-2 py-1 md:px-6 md:py-3">
            <span className="text-[10px] md:text-base">S:</span> <span className="text-yellow-400 font-bold text-sm md:text-xl">{score}</span>
          </div>
        </div>
        
        {/* Threat Direction Indicator - Hide on mobile to save space */}
        <div className="hidden md:block bg-black/70 border-2 border-red-600 rounded-lg px-4 py-2 text-center">
          <p className="text-red-400 text-sm font-bold mb-1">THREATS FROM:</p>
          <div className="flex gap-2 text-lg justify-center">
            <span className="text-green-400">⬇️</span>
            {level >= 2 && <span className="text-green-400">⬆️</span>}
            {level >= 3 && <span className="text-green-400">⬅️</span>}
            {level >= 4 && <span className="text-green-400">➡️</span>}
          </div>
        </div>
        
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
                      const newState = !showEducationDetails
                      setShowEducationDetails(newState)
                      // Track education expansion
                      if (newState && lastThreatType) {
                        const kit = getProtectionKitForThreat(lastThreatType)
                        if (kit) trackEducationExpanded(kit.id)
                      }
                      // Auto-award bonus kit when expanded for first time!
                      if (newState && !bonusKitType) {
                        setBonusKitType(protectionKit.id)
                        setShowBonusNotification(true)
                        setTimeout(() => setShowBonusNotification(false), 3000)
                      }
                    }}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-cyan-900/20 transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">💡</span>
                      <div>
                        <p className="text-cyan-300 text-xs md:text-sm font-extrabold font-mono tracking-wide">
                          WHY YOU DIED
                          {isFirstDeath && !showEducationDetails && (
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
                    <span className="text-lg text-cyan-400 transition-transform duration-300 group-hover:scale-110" style={{ transform: showEducationDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </span>
                  </button>
                  
                  {/* Expandable Content */}
                  {showEducationDetails && (
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
                          setShowLearnMore(true)
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
                  {showBonusNotification && bonusKitType === protectionKit.id && (
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
      {showLearnMore && lastThreatType && (() => {
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
                  setShowLearnMore(false)
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
      {showBonusNotification && bonusKitType && (
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
