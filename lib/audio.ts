/**
 * AudioManager — centralised sound system for Byte Runner.
 *
 * One-shot SFX use the Web Audio API (AudioBuffer + AudioBufferSourceNode) so
 * playback is instantaneous — no per-play decode delay.  Buffers are fetched
 * and decoded immediately on construction so they are warm by the time the
 * player hits Start.
 *
 * Background music uses a plain HTMLAudioElement (simpler for seamless looping).
 *
 * Mute is applied via a master GainNode (SFX) and HTMLAudioElement.volume
 * (music) — toggling mute is instant and does not depend on cloneNode tracking.
 *
 * Safe to call on server — all methods no-op when window is undefined.
 */

const MUTE_KEY = 'br_audio_muted'

const EFFECT_SOURCES: Record<string, string> = {
  'game-start':   '/assets/audio/game-start.mp3',
  'kit-collect':  '/assets/audio/kit-collect-v2.mp3',
  'threat-hit':   '/assets/audio/threat-hit.mp3',
  'level-up':     '/assets/audio/level-up.mp3',
  'game-over':    '/assets/audio/game-over.mp3',
  'quiz-correct': '/assets/audio/quiz-correct.mp3',
  'quiz-wrong':   '/assets/audio/quiz-wrong.mp3',
  'quiz-pass':    '/assets/audio/quiz-pass.mp3',
  'quiz-fail':    '/assets/audio/quiz-fail.mp3',
  'share':        '/assets/audio/share.mp3',
  'prize-win':    '/assets/audio/prize-win.mp3',
  'badge-unlock': '/assets/audio/badge-unlock.mp3',
  'run-saved':    '/assets/audio/run-saved.mp3',
}

const BG_MUSIC_SRC = '/assets/audio/bg-music.mp3'

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private buffers: Map<string, AudioBuffer> = new Map()
  private muted: boolean = false
  private currentMusic: HTMLAudioElement | null = null
  private listeners: Set<() => void> = new Set()
  private unlocked: boolean = false

  constructor() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(MUTE_KEY)
    this.muted = stored === 'true'
    // Start decoding buffers immediately so they are ready before first play.
    this.initCtx()
    this.loadBuffers()
    this.setupUnlock()
  }

  private initCtx(): void {
    if (this.ctx) return
    try {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.muted ? 0 : 1
      this.masterGain.connect(this.ctx.destination)
    } catch { /* Web Audio not available — SFX silently disabled */ }
  }

  private loadBuffers(): void {
    if (!this.ctx) return
    Object.entries(EFFECT_SOURCES).forEach(async ([id, src]) => {
      if (this.buffers.has(id)) return
      try {
        const res = await fetch(src)
        if (!res.ok) return
        const ab = await res.arrayBuffer()
        const buffer = await this.ctx!.decodeAudioData(ab)
        this.buffers.set(id, buffer)
      } catch { /* missing file or decode error — silent fail */ }
    })
  }

  /**
   * Unlock / resume the AudioContext on the first user interaction.
   * We do NOT warm-up bg-music here — playMusic() manages it with its own
   * HTMLAudioElement so the mute button always has full control.
   */
  private setupUnlock(): void {
    const unlock = async () => {
      if (this.unlocked) return
      this.unlocked = true
      try {
        if (this.ctx?.state === 'suspended') await this.ctx.resume()
      } catch { /* silent fail */ }
      // Resume bg-music if playMusic() was called before the user interacted
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

  /** Play a one-shot sound effect (instant — decoded buffer, no cloneNode). */
  play(id: string, volume = 1): void {
    if (typeof window === 'undefined' || this.muted) return
    const buffer = this.buffers.get(id)
    if (!buffer || !this.ctx || !this.masterGain) return
    try {
      const doPlay = () => {
        try {
          const source = this.ctx!.createBufferSource()
          source.buffer = buffer
          const gain = this.ctx!.createGain()
          gain.gain.value = Math.max(0, Math.min(1, volume))
          source.connect(gain)
          gain.connect(this.masterGain!)
          source.start(0)
        } catch { /* silent fail */ }
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(doPlay).catch(() => {})
      } else {
        doPlay()
      }
    } catch { /* silent fail */ }
  }

  /** Start looping background music. */
  playMusic(volume = 0.4): void {
    if (typeof window === 'undefined') return
    if (this.currentMusic) this.stopMusic()
    try {
      const music = new Audio(BG_MUSIC_SRC)
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
    // SFX: control via master gain node
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1
    }
    // Music: control via element volume
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
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1
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
