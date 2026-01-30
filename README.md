# Byte Runner

A cybersecurity educational game built as an endless runner. Learn security concepts through interactive puzzles while dodging obstacles!

## Features

- 🏃 Endless runner gameplay with 3-lane system
- 🎯 Interactive cybersecurity puzzles (phishing detection)
- 📦 Collectibles and obstacles with unique behaviors
- 🎮 Mobile-optimized touch controls
- 🏆 Score tracking and high scores
- 🎨 Pixel art neon cyber aesthetic

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Game Engine**: Phaser 3
- **State Management**: Zustand
- **Animations**: Framer Motion

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

- **Move**: Swipe left/right or use arrow keys to switch lanes
- **Jump**: Swipe up, tap screen, or press up arrow to jump
- **Collect**: Grab yellow data packets for points
- **Avoid**: Dodge obstacles (firewalls, viruses, malware, etc.)
- **Learn**: Solve security puzzles every 1000m

## Obstacles

- 🔥 **Firewall** - Instant game over
- 🦠 **Virus** - Slows you down temporarily
- ⚠️ **Data Breach** - Lose points
- 💀 **Malware** - Reduces visibility
- 📧 **Spam Wave** - Must jump over

## Game Architecture

- `app/` - Next.js pages and routes
- `components/game/` - Game components and Phaser scenes
- `lib/game/` - Game logic, configuration, and events
- `lib/store/` - Zustand state management
- `public/assets/` - Game sprites and assets

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/byte-runner)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Future Features

- [ ] More puzzle types (password strength, SQL injection, etc.)
- [ ] Leaderboards with authentication
- [ ] Daily challenges
- [ ] Power-ups and abilities
- [ ] More obstacle varieties
- [ ] Sound effects and music
- [ ] Mobile app version

## License

MIT License - Feel free to use this for educational purposes!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
