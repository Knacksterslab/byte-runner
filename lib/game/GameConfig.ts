import Phaser from 'phaser'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game-container',
  backgroundColor: '#000011',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 540,  // Half resolution for mobile performance
    height: 960,
    zoom: 1,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  dom: {
    createContainer: true,
  },
}
