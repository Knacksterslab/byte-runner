# Byte Runner - Cybersecurity Endless Runner

A cybersecurity educational game where you learn real defense tools through gameplay. Collect protection kits, survive threats, and master slow-motion quiz challenges!

## Features

- 🏃 **Endless Runner** - WASD/touch controls, smooth 60 FPS
- 🛡️ **8 Protection Kits** - Real cybersecurity tools (Password Manager, MFA, VPN, etc.)
- 🦠 **15 Threat Types** - Phishing, malware, data breaches, and more
- 🧠 **Slow-Motion Quizzes** - Learn while playing, test your knowledge
- 📈 **4 Progressive Zones** - Increasing difficulty with zone transitions
- 🎮 **Mobile-Optimized** - Touch controls, responsive design
- 📊 **Analytics** - Track progress and learning outcomes

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Game Engine**: HTML5 Canvas (custom engine)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Analytics**: Google Analytics 4

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Build for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## How to Play

### Controls
- **Desktop**: WASD or Arrow keys to move
- **Mobile**: Touch and drag to control player

### Game Mechanics
1. **Collect Protection Kits** (🔐 🛡️ 💾) - Stock up on defenses
2. **Survive Threats** - Use kits when hit by attacks
3. **No Kit = Game Over** - Stay stocked or die!
4. **Slow-Motion Quizzes** - Every few levels, test your knowledge
5. **Learn Real Tools** - Each death teaches you actual cybersecurity defenses

### Protection Kits (8 Total)
- 🔐 Password Manager
- 🔗 Link Analyzer
- 🛡️ Patch Manager
- 🕵️ Privacy Optimizer
- 🔒 VPN Shield
- 🔑 MFA Authenticator
- 💾 Backup System (Extra Life!)
- 🎭 Social Engineering Defense

## Project Structure

```
byte-runner/
├── app/                    # Next.js app router
│   ├── page.tsx           # Home/landing page
│   ├── layout.tsx         # Root layout
│   ├── faq/               # FAQ page
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
├── components/
│   ├── game/              # Game components
│   │   ├── SimpleGame.tsx # Main game orchestrator
│   │   ├── QuizModal.tsx  # Quiz modal
│   │   ├── hooks/         # Custom hooks
│   │   │   ├── useQuizState.ts
│   │   │   ├── useTutorialState.ts
│   │   │   └── useUIState.ts
│   │   └── ui/            # UI components
│   │       ├── LoadingScreen.tsx
│   │       ├── StartScreen.tsx
│   │       └── TutorialOverlay.tsx
│   ├── Footer.tsx         # Site footer
│   └── CyberspaceBackground.tsx
├── lib/
│   ├── game/              # Game logic modules
│   │   ├── gameConstants.ts    # Configuration
│   │   ├── utils.ts            # Utilities
│   │   ├── objectPool.ts       # Object pooling
│   │   ├── gameInput.ts        # Input handling
│   │   ├── collisionDetection.ts
│   │   ├── quizSystem.ts       # Quiz mechanics
│   │   ├── backgroundRenderer.ts
│   │   ├── hudRenderer.ts
│   │   ├── playerRenderer.ts
│   │   ├── objectRenderer.ts
│   │   ├── objectGeneration.ts
│   │   ├── threatData.ts       # 15 threat types
│   │   ├── protectionKits.ts   # 8 protection kits
│   │   ├── zones.ts            # 4 game zones
│   │   ├── inGameQuizzes.ts    # Quiz challenges
│   │   └── ghostPlayers.ts     # Attacker personas
│   ├── store/             # Zustand state
│   │   └── gameStore.ts
│   └── analytics.ts       # GA4 tracking
└── public/                # Static assets
    └── assets/sprites/    # Game sprites
```

## Architecture

### Clean Separation of Concerns

**Game Components** (`components/game/`):
- `SimpleGame.tsx` - Main orchestrator with game loop
- Custom hooks for state management
- UI components for screens and overlays

**Game Logic** (`lib/game/`):
- Modular systems (rendering, input, collision, quiz)
- Data files (threats, kits, zones, quizzes)
- Utility functions and constants

**State Management**:
- Zustand for global game state
- Custom hooks for complex state (quiz, tutorial, UI)
- Refs for performance-critical game loop access

### Performance Optimizations

- ✅ Object pooling for efficient memory usage
- ✅ Canvas rendering (60 FPS target)
- ✅ Ref-based state access in game loop (no re-render overhead)
- ✅ Automatic timeout cleanup (no memory leaks)
- ✅ Image preloading with loading screen
- ✅ Responsive design for mobile

## Development

### Code Standards

- **TypeScript** - Full type coverage
- **DRY Principles** - No duplicate code
- **Separation of Concerns** - Modular architecture
- **Memory Safety** - Automatic cleanup
- **<250 Lines Per File** - Focused modules (except main orchestrator)

### Testing

See `TESTING.md` for complete testing checklist.

**Quick Test:**
```bash
npm run dev
# Visit http://localhost:3000
# Press "START GAME"
# Use WASD to play
```

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

**Quick Deploy:**
```bash
vercel --prod
```

## Educational Content

### Learning Approach

1. **Play** - Learn through gameplay, not lectures
2. **Death = Lesson** - Each death teaches real tools
3. **Slow-Motion Quizzes** - Color-coded answers, low pressure
4. **Real Tools** - Actual cybersecurity software recommendations

### Content Coverage

- **Password Security** - Password managers, MFA
- **Phishing Detection** - Email analysis, link checking
- **Network Security** - VPN, WiFi safety
- **System Security** - Patching, backups
- **Privacy** - Data protection, social engineering

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - Free for educational use

## Contact

Questions or feedback? Email: connect@byterunner.co

---

**Built with ❤️ for cybersecurity education**
