import { Keyboard, AlertTriangle, Shield, Skull } from 'lucide-react'
import styles from './StartScreen.module.css'

export function HowToPlayPanel() {
  return (
    <div className={`${styles.panel} px-5 sm:px-8 py-4 text-left`}>
      <span className={styles.panelOutline} />
      <div className={styles.panelTitle}>
        <span className={styles.titleLine} />
        <span>HOW TO PLAY</span>
        <span className={styles.titleLine} />
      </div>
      <div className="space-y-2.5 text-[0.9rem] sm:text-[0.95rem]">
        <div className="flex items-center gap-3 sm:gap-4">
          <Keyboard className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-300 flex-shrink-0" />
          <div><span className="font-bold text-cyan-300">MOVE:</span>{' '}<span className="text-white font-semibold">WASD / Arrows / Touch</span></div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-orange-400 flex-shrink-0" />
          <div><span className="font-bold text-orange-300">DODGE THREATS:</span>{' '}<span className="text-white font-semibold">Avoid hostile enemies</span></div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 flex-shrink-0" />
          <div><span className="font-bold text-emerald-300">COLLECT KITS:</span>{' '}<span className="text-white font-semibold">Protection items</span></div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Skull className="h-6 w-6 sm:h-7 sm:w-7 text-red-400 flex-shrink-0" />
          <div><span className="font-bold text-red-300">NO KIT = GAME OVER:</span>{' '}<span className="text-white font-semibold">Stay stocked</span></div>
        </div>
      </div>
    </div>
  )
}
