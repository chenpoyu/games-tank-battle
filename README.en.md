# 🎮 Tank Battle

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**A classic tank battle web game with responsive design and touch controls**

*Created by Poyu Chen © 2026*

English | [繁體中文](./README.md)

</div>

---

## 📖 Introduction

A classic Tank Battle game built with React + HTML5 Canvas, featuring full support for desktop keyboard controls and mobile touch controls. The game canvas automatically scales based on screen size, providing a smooth experience across phones, tablets, and desktops.

## ✨ Features

- 🖥️ **Responsive Canvas** — Auto-scales to window size, maintaining 16:9 aspect ratio
- 📱 **Mobile-First Design** — Ultra-thin HUD, inline toolbar buttons, maximized game area and controls
- 👴 **Elderly-Friendly Controls** — Large touch targets (44×44px+), controls fill remaining space on mobile
- 🎮 **Dual-Mode Controls** — Keyboard/mouse on desktop, touch on mobile, virtual buttons always visible
- 🤖 **Enemy AI** — Random patrol movement and auto-fire
- 🧱 **Map System** — Destructible brick walls + indestructible steel walls, procedurally generated per level
- 💥 **Collision Detection** — Tank vs walls, tank vs tank, bullet vs tank
- 🏆 **Level System** — Defeat 8 enemies per level with increasing difficulty
- ⛶ **Fullscreen Mode** — One-click fullscreen for immersive gameplay
- 🔄 **Classic Grid Snapping** — Snap-to-grid on direction change for smooth controls

## 🎯 Controls

| Action | Keyboard | Touch / Mouse |
|--------|----------|---------------|
| Move | `W` `A` `S` `D` or Arrow Keys | Virtual D-Pad |
| Fire | `Space` or `J` | FIRE button (red circle) |
| Pause | `P` or `Esc` | Pause button ⏸ (center on mobile) |
| Fullscreen | `F` | ⛶ button (center on mobile) |
| Sound Toggle | — | 🎵 button (top-right corner) |

**Portrait Mobile Mode**: Ultra-thin HUD (28px), inline toolbar buttons in controls area, full-width canvas, remaining space dedicated to large touch controls.

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/chenpoyu/games-tank-battle.git
cd games-tank-battle

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
games-tank-battle/
├── index.html                    # Entry HTML
├── vite.config.js                # Vite config (includes GitHub Pages base path)
├── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions auto-deploy
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component
│   ├── components/
│   │   ├── TankGame.jsx          # Main game component (Canvas + game loop)
│   │   ├── VirtualControls.jsx   # Virtual touch controls
│   │   ├── GameHUD.jsx           # Status display (score/lives/level)
│   │   └── BackgroundMusic.jsx   # Background music player
│   ├── hooks/
│   │   ├── useResponsiveCanvas.js # Responsive canvas size calculation
│   │   └── useInputHandler.js     # Unified keyboard + touch input handler
│   ├── game/
│   │   ├── constants.js          # Game constants and design resolution
│   │   ├── GameEngine.js         # Core game engine (logic layer)
│   │   ├── Tank.js               # Tank class (with grid alignment)
│   │   ├── Bullet.js             # Bullet class
│   │   ├── Wall.js               # Wall class (brick/iron)
│   │   ├── mapGenerator.js       # Map generator
│   │   └── SoundEffects.js       # Sound effects manager (Web Audio API)
│   └── styles/
│       └── GameUI.css            # RWD responsive styles
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| React 19 | UI components and state management |
| HTML5 Canvas | Game rendering engine |
| Web Audio API | 8-bit style sound effects and background music generation |
| Vite 7 | Build tool and dev server |
| CSS Flexbox/Grid | Responsive layout |
| Mobile-First RWD | Mobile-first breakpoint design (≤480px / 481-768px / >768px) |
| Touch Events API | Mobile device controls |
| requestAnimationFrame | 60fps game loop |
| GitHub Actions | CI/CD auto-deployment to GitHub Pages |

## 📦 Deployment

This project is configured with GitHub Actions for automatic deployment to GitHub Pages on push to `main`:

1. Go to your GitHub Repository **Settings → Pages** and set Source to **GitHub Actions**
2. Push code to the `main` branch
3. Actions will automatically build and deploy — access via `https://chenpoyu.github.io/games-tank-battle/`

## 📄 License

MIT License

Copyright © 2026 Poyu Chen. All rights reserved.

## 👨‍💻 Author

**Poyu Chen**
- GitHub: [@chenpoyu](https://github.com/chenpoyu)
- Project: [games-tank-battle](https://github.com/chenpoyu/games-tank-battle)
