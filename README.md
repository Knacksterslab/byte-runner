# Byte Runner - Cybersecurity Endless Runner

A cybersecurity educational game where you learn real defense tools through gameplay. Collect protection kits, survive threats, and master slow-motion quiz challenges!

## Features

- 🏃 **Endless Runner** - WASD/touch controls, adaptive-quality 60 FPS canvas
- 🛡️ **23 Protection Kits** - Real cybersecurity tools (Password Manager, MFA, VPN, etc.)
- 🦠 **60 Threat Types** - Phishing, malware, data breaches, and more
- 🧠 **Quiz Every Level (3+)** - Procedurally drawn from question banks; passing discounts your next level's kit requirement
- 📈 **5 Progressive Zones** - Increasing difficulty with zone transitions
- ⏸️ **Pause & Resume** - Button, P/Esc, auto-pause on tab blur; cross-session run banking
- 🚨 **Daily Incident** - Seeded daily challenge with threat/kit modifiers and streaks
- 📋 **Post-Incident Report** - Death analysis, weak-sector tracking, shareable
- 📱 **PWA** - Installable, offline asset caching, retina-sharp canvas
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
│   ├── layout.tsx         # Root layout (PWA metadata, SW registration)
│   ├── admin/             # Admin panel
│   ├── contests/          # Contests pages
│   ├── profile/           # Player profile
│   ├── faq/ privacy/ terms/
├── components/
│   ├── game/
│   │   ├── SimpleGame.tsx # Main game orchestrator
│   │   ├── QuizModal.tsx  # Quiz modal
│   │   ├── hooks/         # useGameLoop, useQuizState, useAssetLoader, ...
│   │   └── ui/            # StartScreen, GameOverScreen, DailyChallengeCard,
│   │                     # PostIncidentReport, HourlyChallengeBanner, ...
│   ├── Footer.tsx
│   └── CyberspaceBackground.tsx
├── lib/
│   ├── game/
│   │   ├── engine/        # Game loop: createGameEngine, GameState, spawn,
│   │   │                  # quiz logic, adaptive quality, backgrounds
│   │   ├── renderers/     # Overlay renderers + procedural entity renderer
│   │   ├── visuals.ts     # SINGLE SOURCE OF TRUTH for entity visuals
│   │   ├── data/          # Threats (60), kits (23), quiz banks (62 Qs)
│   │   ├── threatData.ts protectionKits.ts zones.ts inGameQuizzes.ts
│   │   └── gameConstants.ts difficulty.ts ghostPlayers.ts
│   ├── api/               # Typed API client + endpoint modules (daily, ...)
│   ├── store/             # Zustand state
│   └── analytics.ts       # GA4 tracking
├── public/
│   ├── sw.js              # Service worker (PWA)
│   ├── manifest.json      # PWA manifest
│   └── assets/audio/      # Sound effects + music (WebP images in /)
└── generate-favicons.js   # Favicon generator (uses logo.png)
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

A fresh launch QA checklist is maintained in the workspace `ROADMAP.md` ship steps.

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
