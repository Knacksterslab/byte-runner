import Phaser from 'phaser'
import { gameEvents, GameEvent } from '@/lib/game/GameEvents'

interface Email {
  id: string
  from: string
  subject: string
  body: string
  isPhishing: boolean
  redFlags: string[]
}

export default class PhishingPuzzleScene extends Phaser.Scene {
  private emails: Email[] = []
  private selectedEmailId: string | null = null
  private timeLeft = 30
  private timerText!: Phaser.GameObjects.Text
  private timerEvent?: Phaser.Time.TimerEvent
  private emailCards: Phaser.GameObjects.Container[] = []
  
  constructor() {
    super('PhishingPuzzleScene')
  }
  
  create() {
    // Semi-transparent overlay
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    )
    
    // Title
    this.add.text(this.scale.width / 2, 80, 'SECURITY CHECKPOINT', {
      fontSize: '32px',
      fontFamily: 'Courier New',
      color: '#00ffff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5)
    
    this.add.text(this.scale.width / 2, 130, 'Identify the Phishing Email', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    
    // Generate emails
    this.emails = this.generateEmails()
    
    // Display emails
    const startY = 200
    const cardHeight = 180
    const spacing = 20
    
    this.emails.forEach((email, index) => {
      const card = this.createEmailCard(email, startY + (index * (cardHeight + spacing)))
      this.emailCards.push(card)
      this.add.existing(card)
    })
    
    // Timer
    this.timerText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 100,
      `Time: ${this.timeLeft}s`,
      {
        fontSize: '24px',
        color: '#ff5555',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5)
    
    // Start timer
    this.startTimer()
    
    // Skip button
    const skipButton = this.add.rectangle(
      this.scale.width - 40,
      40,
      60,
      60,
      0x333333
    ).setStrokeStyle(2, 0x666666)
    .setInteractive()
    
    this.add.text(this.scale.width - 40, 40, 'X', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5)
    
    skipButton.on('pointerdown', () => {
      this.closePuzzle()
    })
  }
  
  generateEmails(): Email[] {
    const emailSets = [
      // Set 1
      [
        {
          id: 'email1',
          from: 'security@your-bank.com',
          subject: 'URGENT: Verify Your Account Now',
          body: 'Dear customer, we detected suspicious activity. Click here immediately to verify your account or it will be suspended.',
          isPhishing: true,
          redFlags: [
            'Generic greeting ("Dear customer")',
            'Urgent/threatening language',
            'Suspicious sender domain',
            'Requests immediate action'
          ]
        },
        {
          id: 'email2',
          from: 'newsletter@techcrunch.com',
          subject: 'This Week in Tech - January Edition',
          body: 'Hi there! Check out our latest articles on AI, cybersecurity, and startup news from this week.',
          isPhishing: false,
          redFlags: [
            'Expected newsletter',
            'No urgent requests',
            'Legitimate sender',
            'Personalized greeting'
          ]
        },
        {
          id: 'email3',
          from: 'john.smith@company.com',
          subject: 'RE: Q1 Budget Meeting',
          body: 'Thanks for the meeting today. I\'ve attached the Q1 budget spreadsheet as discussed. Let me know if you need anything else.',
          isPhishing: false,
          redFlags: [
            'Work-related context',
            'Professional tone',
            'No suspicious requests',
            'Known sender'
          ]
        }
      ],
      // Set 2
      [
        {
          id: 'email4',
          from: 'support@microsoft-verify.com',
          subject: 'Your Windows License Expires Today',
          body: 'Your Windows license will expire in 24 hours. Click here to renew now and avoid service interruption. Payment required.',
          isPhishing: true,
          redFlags: [
            'Fake Microsoft domain',
            'Creates false urgency',
            'Requests payment',
            'Threatening tone'
          ]
        },
        {
          id: 'email5',
          from: 'alerts@github.com',
          subject: 'New star on your repository',
          body: 'Congratulations! Your project "byte-runner" received a new star from developer @john_doe.',
          isPhishing: false,
          redFlags: [
            'Legitimate notification',
            'Expected service alert',
            'No action required',
            'Authentic sender'
          ]
        },
        {
          id: 'email6',
          from: 'noreply@paypal-security.net',
          subject: 'Unusual Activity Detected',
          body: 'We noticed a login from an unrecognized device. Verify your identity by clicking this link within 2 hours.',
          isPhishing: true,
          redFlags: [
            'Suspicious PayPal domain (.net not .com)',
            'Time pressure tactic',
            'Generic warning',
            'Requests verification via link'
          ]
        }
      ]
    ]
    
    // Select a random email set
    return Phaser.Utils.Array.GetRandom(emailSets)
  }
  
  createEmailCard(email: Email, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(this.scale.width / 2, y)
    
    const cardWidth = this.scale.width - 40
    const cardHeight = 160
    
    // Card background
    const card = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x222222)
      .setStrokeStyle(2, email.isPhishing ? 0xff4444 : 0x444444)
      .setInteractive()
    
    // Email content
    const padding = 15
    const maxWidth = cardWidth - (padding * 2)
    
    const fromText = this.add.text(
      -cardWidth / 2 + padding,
      -cardHeight / 2 + padding,
      `From: ${email.from}`,
      {
        fontSize: '14px',
        color: '#aaaaaa',
        fontFamily: 'Courier New',
        wordWrap: { width: maxWidth }
      }
    )
    
    const subjectText = this.add.text(
      -cardWidth / 2 + padding,
      fromText.y + fromText.height + 5,
      `Subject: ${email.subject}`,
      {
        fontSize: '16px',
        color: '#ffff00',
        fontFamily: 'Courier New',
        wordWrap: { width: maxWidth }
      }
    )
    
    const bodyText = this.add.text(
      -cardWidth / 2 + padding,
      subjectText.y + subjectText.height + 8,
      email.body.substring(0, 100) + (email.body.length > 100 ? '...' : ''),
      {
        fontSize: '14px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        wordWrap: { width: maxWidth }
      }
    )
    
    container.add([card, fromText, subjectText, bodyText])
    
    // Click handler
    card.on('pointerdown', () => {
      this.selectEmail(email)
    })
    
    // Hover effect
    card.on('pointerover', () => {
      card.setStrokeStyle(3, 0x00ffff)
    })
    
    card.on('pointerout', () => {
      card.setStrokeStyle(2, email.isPhishing ? 0xff4444 : 0x444444)
    })
    
    return container
  }
  
  startTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--
        this.timerText.setText(`Time: ${this.timeLeft}s`)
        
        if (this.timeLeft <= 0) {
          this.handleTimeout()
        } else if (this.timeLeft <= 10) {
          this.timerText.setColor('#ff0000')
        }
      },
      callbackScope: this,
      loop: true
    })
  }
  
  selectEmail(email: Email) {
    if (this.selectedEmailId) return // Already selected
    
    this.selectedEmailId = email.id
    
    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove()
    }
    
    // Clear email cards
    this.emailCards.forEach(card => card.destroy())
    this.timerText.destroy()
    
    // Show result
    this.showResult(email)
  }
  
  showResult(email: Email) {
    const resultContainer = this.add.container(this.scale.width / 2, this.scale.height / 2)
    
    // Result text
    const isCorrect = email.isPhishing
    const resultText = this.add.text(
      0,
      -200,
      isCorrect ? 'CORRECT!' : 'INCORRECT',
      {
        fontSize: '48px',
        color: isCorrect ? '#00ff00' : '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      }
    ).setOrigin(0.5)
    
    const feedbackText = this.add.text(
      0,
      -130,
      isCorrect 
        ? 'Good eye! You identified the phishing attempt.' 
        : 'That was a legitimate email. Watch out!',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Courier New',
        wordWrap: { width: 400 },
        align: 'center'
      }
    ).setOrigin(0.5)
    
    resultContainer.add([resultText, feedbackText])
    
    // Show learning moment
    this.showLearningTip(email.redFlags, 0)
    
    // Continue button
    this.time.delayedCall(2000, () => {
      const continueBtn = this.add.rectangle(
        this.scale.width / 2,
        this.scale.height - 100,
        200,
        60,
        0x00ffff
      ).setInteractive()
      
      this.add.text(
        this.scale.width / 2,
        this.scale.height - 100,
        'CONTINUE',
        {
          fontSize: '24px',
          color: '#000000',
          fontFamily: 'Courier New'
        }
      ).setOrigin(0.5)
      
      continueBtn.on('pointerdown', () => {
        if (isCorrect) {
          gameEvents.emit(GameEvent.PUZZLE_COMPLETE, { success: true })
        }
        this.closePuzzle()
      })
    })
  }
  
  showLearningTip(redFlags: string[], yOffset: number) {
    const tipContainer = this.add.container(this.scale.width / 2, 350 + yOffset)
    
    const bg = this.add.rectangle(0, 0, this.scale.width - 40, 250, 0x001122, 0.9)
      .setStrokeStyle(2, 0x00ffff)
    
    const titleText = this.add.text(0, -100, 'RED FLAGS:', {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5)
    
    tipContainer.add([bg, titleText])
    
    redFlags.slice(0, 3).forEach((flag, index) => {
      const flagText = this.add.text(
        0,
        -60 + (index * 35),
        `• ${flag}`,
        {
          fontSize: '16px',
          color: '#ffff00',
          fontFamily: 'Courier New',
          wordWrap: { width: this.scale.width - 80 }
        }
      ).setOrigin(0.5)
      
      tipContainer.add(flagText)
    })
    
    tipContainer.setAlpha(0)
    this.tweens.add({
      targets: tipContainer,
      alpha: 1,
      duration: 500
    })
  }
  
  handleTimeout() {
    if (this.timerEvent) {
      this.timerEvent.remove()
    }
    
    // Clear email cards
    this.emailCards.forEach(card => card.destroy())
    this.timerText.destroy()
    
    const timeoutText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'TIME\'S UP!',
      {
        fontSize: '56px',
        color: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      }
    ).setOrigin(0.5)
    
    this.time.delayedCall(2000, () => {
      this.closePuzzle()
    })
  }
  
  closePuzzle() {
    this.scene.stop()
    this.scene.get('RunnerScene').scene.resume()
  }
}
