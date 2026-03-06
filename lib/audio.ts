/**
 * AudioManager — centralised sound system for Byte Runner.
 *
 * - All sounds are optional: missing files fail silently.
 * - Mute state is persisted in localStorage.
 * - Browser autoplay policy is handled: audio is unlocked on first user interaction.
 * - Safe to call on server (all methods no-op when window is undefined).
 */

const MUTE_KEY = 'br_audio_muted'

const SOUND_SOURCES: Record<string, string> = {
  'game-start':    '/assets/audio/game-start.mp3',
  'kit-collect':   '/assets/audio/kit-collect.mp3',
  'threat-hit':    '/assets/audio/threat-hit.mp3',
  'level-up':      '/assets/audio/level-up.mp3',
  'game-over':     '/assets/audio/game-over.mp3',
  'quiz-correct':  '/assets/audio/quiz-correct.mp3',
  'quiz-wrong':    '/assets/audio/quiz-wrong.mp3',
  'quiz-pass':     '/assets/audio/quiz-pass.mp3',
  'quiz-fail':     '/assets/audio/quiz-fail.mp3',
  'share':         '/assets/audio/share.mp3',
  'prize-win':     '/assets/audio/prize-win.mp3',
  'badge-unlock':  '/assets/audio/badge-unlock.mp3',
  'run-saved':     '/assets/audio/run-saved.mp3',
  'bg-music':      '/assets/audio/bg-music.mp3',
}

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private muted: boolean = false
  private unlocked: boolean = false
  private currentMusic: HTMLAudioElement | null = null
  private listeners: Set<() => void> = new Set()

  constructor() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(MUTE_KEY)
    this.muted = stored === 'true'
    this.preload()
    this.setupUnlock()
  }

  private preload() {
    Object.entries(SOUND_SOURCES).forEach(([id, src]) => {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.src = src
      audio.onerror = () => { /* missing file — silent fail */ }
      this.sounds.set(id, audio)
    })
  }

  /** Unlock audio context on first user interaction (browser autoplay policy). */
  private setupUnlock() {
    const unlock = () => {
      if (this.unlocked) return
      this.unlocked = true
      // Warm up all audio elements so the browser permits future playback
      this.sounds.forEach(audio => {
        const attempt = audio.play()
        if (attempt) attempt.then(() => audio.pause()).catch(() => {})
      })
      // Resume bg-music if it was attempted before the user interacted
      if (this.currentMusic && this.currentMusic.paused) {
        this.currentMusic.play().catch(() => {})
      }
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('click', unlock)
    window.addEventListener('touchstart', unlock)
    window.addEventListener('keydown', unlock)
  }

  /** Play a one-shot sound effect. */
  play(id: string, volume = 1): void {
    if (typeof window === 'undefined' || this.muted) return
    const src = this.sounds.get(id)
    if (!src) return
    try {
      const clone = src.cloneNode() as HTMLAudioElement
      clone.volume = Math.max(0, Math.min(1, volume))
      clone.play().catch(() => { /* autoplay blocked — silent fail */ })
    } catch { /* silent fail */ }
  }

  /** Start looping background music. */
  playMusic(volume = 0.4): void {
    if (typeof window === 'undefined') return
    const src = this.sounds.get('bg-music')
    if (!src) return
    if (this.currentMusic) this.stopMusic()
    try {
      const music = src.cloneNode() as HTMLAudioElement
      music.loop = true
      music.volume = this.muted ? 0 : Math.max(0, Math.min(1, volume))
      music.play().catch(() => {})
      this.currentMusic = music
    } catch { /* silent fail */ }
  }

  stopMusic(): void {
    if (!this.currentMusic) return
    try {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
    } catch { /* silent fail */ }
    this.currentMusic = null
  }

  isMuted(): boolean {
    return this.muted
  }

  toggleMute(): void {
    this.muted = !this.muted
    if (typeof window !== 'undefined') {
      localStorage.setItem(MUTE_KEY, String(this.muted))
    }
    if (this.currentMusic) {
      this.currentMusic.volume = this.muted ? 0 : 0.4
    }
    this.notifyListeners()
  }

  setMuted(muted: boolean): void {
    if (this.muted === muted) return
    this.muted = muted
    if (typeof window !== 'undefined') {
      localStorage.setItem(MUTE_KEY, String(this.muted))
    }
    if (this.currentMusic) {
      this.currentMusic.volume = this.muted ? 0 : 0.4
    }
    this.notifyListeners()
  }

  /** Subscribe to mute state changes (for React re-renders). */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn())
  }
}

export const audioManager = typeof window !== 'undefined'
  ? new AudioManager()
  : { play: () => {}, playMusic: () => {}, stopMusic: () => {}, isMuted: () => false, toggleMute: () => {}, setMuted: () => {}, subscribe: () => () => {} } as unknown as AudioManager
