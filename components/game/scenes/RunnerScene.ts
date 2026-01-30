import Phaser from 'phaser'
import { gameEvents, GameEvent, CollectEvent, CollisionEvent, DistanceEvent } from '@/lib/game/GameEvents'
import { GAME_CONFIG, OBSTACLE_TYPES, COLLECTIBLE_TYPES } from '@/lib/game/types'

export default class RunnerScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private obstacles!: Phaser.Physics.Arcade.Group
  private collectibles!: Phaser.Physics.Arcade.Group
  private background!: Phaser.GameObjects.TileSprite
  
  // Lane system
  private currentLane = 1 // 0-left, 1-center, 2-right
  private lanesX: number[] = []
  private isChangingLane = false
  
  // Game state
  private baseSpeed = GAME_CONFIG.BASE_SPEED
  private distanceTraveled = 0
  private lastCheckpoint = 0
  private isSlowed = false
  private slowTimeout?: NodeJS.Timeout
  private visibilityReduced = false
  private visibilityTimeout?: NodeJS.Timeout
  
  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private touchStartX = 0
  private touchStartY = 0
  
  // Particles
  private trailParticles?: Phaser.GameObjects.Particles.ParticleEmitter
  
  constructor() {
    super('RunnerScene')
  }
  
  preload() {
    // Load all game assets
    this.load.image('player', '/assets/sprites/player.png')
    this.load.image('data-packet', '/assets/sprites/data-packet.png')
    this.load.image('firewall', '/assets/sprites/firewall.png')
    this.load.image('virus', '/assets/sprites/virus.png')
    this.load.image('data-breach', '/assets/sprites/data-breach.png')
    this.load.image('malware', '/assets/sprites/malware.png')
    this.load.image('spam-wave', '/assets/sprites/spam-wave.png')
    this.load.image('tunnel-bg', '/assets/sprites/tunnel-bg.png')
  }
  
  create() {
    // Add dark background first
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000011
    ).setScrollFactor(0).setDepth(-2)
    
    // Calculate lane positions
    const gameWidth = this.scale.width
    const laneWidth = GAME_CONFIG.LANE_WIDTH
    const startX = (gameWidth - (laneWidth * 2)) / 2
    this.lanesX = [
      startX,
      startX + laneWidth,
      startX + laneWidth * 2
    ]
    
    // Create scrolling background with lower opacity
    this.background = this.add.tileSprite(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      'tunnel-bg'
    ).setScrollFactor(0).setDepth(-1).setAlpha(0.6)
    
    // Create player with better visibility
    this.player = this.physics.add.sprite(
      this.lanesX[this.currentLane],
      this.scale.height - 200,
      'player'
    )
    this.player.setScale(0.8) // Larger for better visibility
    this.player.setCollideWorldBounds(true)
    this.player.body!.setSize(this.player.width * 0.6, this.player.height * 0.8)
    this.player.setDepth(10) // Ensure player is on top
    
    // Add glow effect to player
    this.player.setTint(0x00ffff)
    
    // Create groups for obstacles and collectibles
    this.obstacles = this.physics.add.group({
      maxSize: 50,
      runChildUpdate: false
    })
    
    this.collectibles = this.physics.add.group({
      maxSize: 100,
      runChildUpdate: false
    })
    
    // Setup collisions
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.handleCollect as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )
    
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.handleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )
    
    // Setup input - ensure keyboard is captured
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
      
      // Add WASD keys as alternative
      this.input.keyboard.addKeys({
        'A': Phaser.Input.Keyboard.KeyCodes.A,
        'D': Phaser.Input.Keyboard.KeyCodes.D,
        'W': Phaser.Input.Keyboard.KeyCodes.W,
        'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE
      })
    }
    
    // Make sure game has focus
    this.input.setDefaultCursor('pointer')
    
    // Touch controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x
      this.touchStartY = pointer.y
    })
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const deltaX = pointer.x - this.touchStartX
      const deltaY = pointer.y - this.touchStartY
      const swipeThreshold = 50
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > swipeThreshold) {
          this.moveRight()
        } else if (deltaX < -swipeThreshold) {
          this.moveLeft()
        }
      } else if (Math.abs(deltaY) > swipeThreshold) {
        // Vertical swipe
        if (deltaY < -swipeThreshold) {
          this.jump()
        }
      } else {
        // Tap
        this.jump()
      }
    })
    
    // Create particle trail
    this.trailParticles = this.add.particles(0, 0, 'data-packet', {
      x: this.player.x,
      y: this.player.y + 30,
      speed: { min: -50, max: 50 },
      scale: { start: 0.15, end: 0 },
      lifespan: 400,
      quantity: 2,
      frequency: 80,
      blendMode: 'ADD',
      alpha: 0.8,
      tint: 0x00ffff
    })
    
    this.trailParticles.startFollow(this.player)
    this.trailParticles.setDepth(5)
    
    // Start distance counter
    this.time.addEvent({
      delay: 100,
      callback: this.updateDistance,
      callbackScope: this,
      loop: true
    })
    
    // Start spawning obstacles
    this.time.addEvent({
      delay: Phaser.Math.Between(GAME_CONFIG.SPAWN_INTERVAL_MIN, GAME_CONFIG.SPAWN_INTERVAL_MAX),
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    })
    
    // Start spawning collectibles
    this.time.addEvent({
      delay: Phaser.Math.Between(GAME_CONFIG.COLLECTIBLE_SPAWN_MIN, GAME_CONFIG.COLLECTIBLE_SPAWN_MAX),
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true
    })
    
    // Emit game start event
    gameEvents.emit(GameEvent.GAME_START)
  }
  
  spawnObstacle() {
    // Random lane
    const lane = Phaser.Math.Between(0, 2)
    
    // Select obstacle type based on difficulty (distance traveled)
    const difficulty = Math.floor(this.distanceTraveled / 500)
    let obstacleType: string
    
    if (difficulty === 0) {
      // Early game: only virus (less punishing)
      obstacleType = 'virus'
    } else if (difficulty === 1) {
      // Mid early: add data-breach
      obstacleType = Phaser.Utils.Array.GetRandom(['virus', 'data-breach'])
    } else if (difficulty === 2) {
      // Mid game: add firewall
      obstacleType = Phaser.Utils.Array.GetRandom(['virus', 'data-breach', 'firewall'])
    } else if (difficulty === 3) {
      // Late mid: add malware
      obstacleType = Phaser.Utils.Array.GetRandom(['virus', 'data-breach', 'firewall', 'malware'])
    } else {
      // Late game: all obstacles including spam-wave
      obstacleType = Phaser.Utils.Array.GetRandom(OBSTACLE_TYPES.map(o => o.key))
    }
    
    // Get or create obstacle from pool
    let obstacle = this.obstacles.getFirstDead(false) as Phaser.Physics.Arcade.Sprite
    
    if (!obstacle) {
      obstacle = this.obstacles.create(0, 0, obstacleType) as Phaser.Physics.Arcade.Sprite
      obstacle.setScale(0.5)
    } else {
      obstacle.setTexture(obstacleType)
      obstacle.setActive(true)
      obstacle.setVisible(true)
    }
    
    // Position obstacle
    obstacle.setPosition(this.lanesX[lane], -50)
    obstacle.body!.setSize(obstacle.width * 0.8, obstacle.height * 0.8)
    
    // Add animation based on type
    if (obstacleType === 'virus') {
      this.tweens.add({
        targets: obstacle,
        angle: 360,
        duration: 2000,
        repeat: -1
      })
    } else if (obstacleType === 'spam-wave') {
      obstacle.setScale(1, 0.3) // Horizontal wave
    }
  }
  
  spawnCollectible() {
    // Random lane
    const lane = Phaser.Math.Between(0, 2)
    
    // Select collectible type (currently only data-packet)
    const collectibleType = 'data-packet'
    
    // Get or create collectible from pool
    let collectible = this.collectibles.getFirstDead(false) as Phaser.Physics.Arcade.Sprite
    
    if (!collectible) {
      collectible = this.collectibles.create(0, 0, collectibleType) as Phaser.Physics.Arcade.Sprite
      collectible.setScale(0.4)
    } else {
      collectible.setTexture(collectibleType)
      collectible.setActive(true)
      collectible.setVisible(true)
    }
    
    // Position collectible
    collectible.setPosition(this.lanesX[lane], -50)
    collectible.body!.setSize(collectible.width * 0.6, collectible.height * 0.6)
    
    // Float animation
    this.tweens.add({
      targets: collectible,
      y: collectible.y - 20,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  update(time: number, delta: number) {
    // Scroll background slower for better visual stability
    this.background.tilePositionY -= this.baseSpeed * 1.5
    
    // Handle keyboard input with multiple key options
    if (this.cursors) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
        this.moveLeft()
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
        this.moveRight()
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || 
                 Phaser.Input.Keyboard.JustDown(this.cursors.space!)) {
        this.jump()
      }
    }
    
    // Also check WASD
    const keys = this.input.keyboard?.addKeys('A,D,W,SPACE') as any
    if (keys) {
      if (Phaser.Input.Keyboard.JustDown(keys.A)) {
        this.moveLeft()
      } else if (Phaser.Input.Keyboard.JustDown(keys.D)) {
        this.moveRight()
      } else if (Phaser.Input.Keyboard.JustDown(keys.W) || 
                 Phaser.Input.Keyboard.JustDown(keys.SPACE)) {
        this.jump()
      }
    }
    
    // Move obstacles
    this.obstacles.children.each((child) => {
      const obstacle = child as Phaser.Physics.Arcade.Sprite
      if (!obstacle.active) return true
      
      obstacle.y -= this.baseSpeed
      
      // Recycle if off screen
      if (obstacle.y < -100) {
        obstacle.setActive(false)
        obstacle.setVisible(false)
      }
      
      return true
    })
    
    // Move collectibles
    this.collectibles.children.each((child) => {
      const collectible = child as Phaser.Physics.Arcade.Sprite
      if (!collectible.active) return true
      
      collectible.y -= this.baseSpeed
      
      // Recycle if off screen
      if (collectible.y < -100) {
        collectible.setActive(false)
        collectible.setVisible(false)
      }
      
      return true
    })
    
    // Check for puzzle checkpoint
    if (this.distanceTraveled - this.lastCheckpoint >= GAME_CONFIG.PUZZLE_CHECKPOINT) {
      this.triggerPuzzle()
    }
    
    // Apply visibility effect
    if (this.visibilityReduced) {
      this.cameras.main.setAlpha(0.5)
    } else {
      this.cameras.main.setAlpha(1)
    }
  }
  
  moveLeft() {
    if (this.isChangingLane || this.currentLane <= 0) return
    
    this.currentLane--
    this.isChangingLane = true
    
    this.tweens.add({
      targets: this.player,
      x: this.lanesX[this.currentLane],
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.isChangingLane = false
      }
    })
  }
  
  moveRight() {
    if (this.isChangingLane || this.currentLane >= 2) return
    
    this.currentLane++
    this.isChangingLane = true
    
    this.tweens.add({
      targets: this.player,
      x: this.lanesX[this.currentLane],
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.isChangingLane = false
      }
    })
  }
  
  jump() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (body.touching.down) {
      this.player.setVelocityY(GAME_CONFIG.JUMP_FORCE)
    }
  }
  
  handleCollect(player: Phaser.GameObjects.GameObject, collectible: Phaser.GameObjects.GameObject) {
    const sprite = collectible as Phaser.Physics.Arcade.Sprite
    
    if (!sprite.active) return
    
    const type = sprite.texture.key
    const collectibleDef = COLLECTIBLE_TYPES.find(c => c.key === type)
    
    if (collectibleDef) {
      // Emit collect event
      const event: CollectEvent = {
        type: collectibleDef.key,
        points: collectibleDef.points
      }
      gameEvents.emit(GameEvent.COLLECT, event)
      
      // Particle effect
      this.add.particles(sprite.x, sprite.y, sprite.texture.key, {
        speed: { min: -100, max: 100 },
        scale: { start: 0.3, end: 0 },
        lifespan: 500,
        quantity: 5,
        blendMode: 'ADD'
      })
    }
    
    // Recycle sprite
    sprite.setActive(false)
    sprite.setVisible(false)
  }
  
  handleCollision(player: Phaser.GameObjects.GameObject, obstacle: Phaser.GameObjects.GameObject) {
    const sprite = obstacle as Phaser.Physics.Arcade.Sprite
    
    if (!sprite.active) return
    
    const type = sprite.texture.key
    const obstacleDef = OBSTACLE_TYPES.find(o => o.key === type)
    
    if (obstacleDef) {
      // Emit collision event
      const event: CollisionEvent = {
        type: obstacleDef.key,
        effect: obstacleDef.effect,
        damage: obstacleDef.damage
      }
      gameEvents.emit(GameEvent.COLLISION, event)
      
      // Apply effect
      switch (obstacleDef.effect) {
        case 'gameover':
          this.gameOver()
          break
        case 'slow':
          this.applySlow()
          break
        case 'damage':
          // Damage handled by UI
          break
        case 'visibility':
          this.applyVisibilityReduction()
          break
      }
      
      // Flash effect
      this.cameras.main.flash(300, 255, 0, 0)
    }
    
    // Recycle sprite
    sprite.setActive(false)
    sprite.setVisible(false)
  }
  
  applySlow() {
    this.isSlowed = true
    this.baseSpeed = Math.max(3, this.baseSpeed - 2)
    
    if (this.slowTimeout) {
      clearTimeout(this.slowTimeout)
    }
    
    this.slowTimeout = setTimeout(() => {
      this.isSlowed = false
      this.baseSpeed = GAME_CONFIG.BASE_SPEED
    }, 3000)
  }
  
  applyVisibilityReduction() {
    this.visibilityReduced = true
    
    if (this.visibilityTimeout) {
      clearTimeout(this.visibilityTimeout)
    }
    
    this.visibilityTimeout = setTimeout(() => {
      this.visibilityReduced = false
    }, 2000)
  }
  
  updateDistance() {
    this.distanceTraveled += this.baseSpeed
    
    const event: DistanceEvent = {
      distance: Math.floor(this.distanceTraveled)
    }
    gameEvents.emit(GameEvent.DISTANCE, event)
  }
  
  triggerPuzzle() {
    this.lastCheckpoint = this.distanceTraveled
    
    // Pause this scene
    this.scene.pause()
    
    // Launch puzzle scene
    this.scene.launch('PhishingPuzzleScene')
    
    gameEvents.emit(GameEvent.PUZZLE_START)
  }
  
  gameOver() {
    this.scene.pause()
    gameEvents.emit(GameEvent.GAME_OVER)
  }
  
  // Public methods called from React
  resumeGame() {
    this.scene.resume()
  }
  
  restartGame() {
    this.distanceTraveled = 0
    this.lastCheckpoint = 0
    this.currentLane = 1
    this.baseSpeed = GAME_CONFIG.BASE_SPEED
    this.isSlowed = false
    this.visibilityReduced = false
    
    // Clear all obstacles and collectibles
    this.obstacles.clear(true, true)
    this.collectibles.clear(true, true)
    
    // Reset player position
    this.player.setPosition(this.lanesX[this.currentLane], this.scale.height - 200)
    this.player.setVelocity(0, 0)
    
    // Resume scene
    this.scene.restart()
  }
}
