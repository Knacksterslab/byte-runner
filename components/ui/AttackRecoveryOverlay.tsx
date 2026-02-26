'use client'

import type { RecoverySponsor } from '@/lib/api/sponsors'
import type { RecoveryOverlayOption2 } from '@/lib/game/utils/recoveryUtils'
import styles from './AttackRecoveryOverlay.module.css'

interface AttackRecoveryOverlayProps {
  overlay: RecoveryOverlayOption2
  fullScreen?: boolean
  sponsor?: RecoverySponsor | null
}

export default function AttackRecoveryOverlay({
  overlay,
  fullScreen = false,
  sponsor = null,
}: AttackRecoveryOverlayProps) {
  const leftBar = Math.max(5, Math.min(100, (overlay.leftPanel.barValue ?? 0.25) * 100))
  const rightBar = Math.max(5, Math.min(100, (overlay.rightPanel.barValue ?? 1) * 100))
  const chargePct = Math.max(0, Math.min(100, overlay.progress * 100))

  return (
    <div className={`${styles.screen} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.deepBg} />
      <div className={styles.vignette} />
      <div className={styles.holoBurst} />
      <div className={styles.hazeLayer} />
      <div className={styles.scanLines} />
      <div className={styles.arenaGrid} />
      <div className={`${styles.spark} ${styles.sparkA}`} />
      <div className={`${styles.spark} ${styles.sparkB}`} />
      <div className={`${styles.spark} ${styles.sparkC}`} />

      <main className={styles.frame}>
        <section className={styles.alertPanel}>
          <div className={styles.alertBadge}>!</div>
          <div className={styles.alertText}>
            <h1>{overlay.attackLabel}</h1>
            <p>{overlay.attackSubtext.toUpperCase()}</p>
          </div>
        </section>

        <section className={styles.protectPanel}>
          <div className={styles.protectTitle}>
            <span>PROTECTION</span>
            <span className={styles.checkGlow}>✓</span>
            <span>ACTIVATED</span>
          </div>
          <div className={styles.protectSub}>{overlay.protectionLabel.toUpperCase()}</div>
        </section>

        {sponsor && (
          <section className={styles.sponsorSlot} aria-label="Sponsor placement">
            <div className={styles.sponsorTag}>{sponsor.tag ?? 'SPONSORED'}</div>
            <div className={styles.sponsorContent}>
              <div className={styles.sponsorLogo}>{sponsor.logo ?? 'AD'}</div>
              <div className={styles.sponsorText}>
                <h4>{sponsor.title}</h4>
                <p>{sponsor.description}</p>
              </div>
              {sponsor.ctaUrl ? (
                <a href={sponsor.ctaUrl} target="_blank" rel="noopener noreferrer" className={styles.sponsorCta}>
                  {sponsor.ctaLabel ?? 'LEARN MORE'}
                </a>
              ) : (
                <button className={styles.sponsorCta}>{sponsor.ctaLabel ?? 'LEARN MORE'}</button>
              )}
            </div>
          </section>
        )}

        <section className={styles.middleZone}>
          <article className={`${styles.passCard} ${styles.danger}`}>
            <div className={styles.passName}>{overlay.leftPanel.label}</div>
            <div className={styles.tag}>{overlay.leftPanel.subtexts[0] ?? 'RISK'}</div>
            <div className={styles.muted}>{overlay.leftPanel.barLabel ?? overlay.leftPanel.subtexts[1] ?? ''}</div>
            <div className={styles.miniBar}><span style={{ width: `${leftBar}%` }} /></div>
            <div className={`${styles.score} ${styles.bad}`}>{overlay.leftPanel.pointsDisplay} PTS</div>
          </article>

          <div className={styles.avatarZone}>
            <div className={`${styles.beam} ${styles.redBeam}`} />
            <div className={styles.platform}>
              <div className={`${styles.ring} ${styles.ring1}`} />
              <div className={`${styles.ring} ${styles.ring2}`} />
              <div className={`${styles.ring} ${styles.ring3}`} />
              <div className={styles.avatar}>
                <div className={styles.head} />
                <div className={styles.body} />
              </div>
            </div>
            <div className={`${styles.beam} ${styles.greenBeam}`} />
          </div>

          <article className={`${styles.passCard} ${styles.safe}`}>
            <div className={styles.passName}>{overlay.rightPanel.label}</div>
            <div className={styles.tag}>{overlay.rightPanel.subtexts[0] ?? 'SAFE'}</div>
            <div className={styles.muted}>{overlay.rightPanel.barLabel ?? overlay.rightPanel.subtexts[1] ?? ''}</div>
            <div className={styles.miniBar}><span style={{ width: `${rightBar}%` }} /></div>
            <div className={`${styles.score} ${styles.good}`}>{overlay.rightPanel.pointsDisplay} PTS</div>
          </article>
        </section>

        <section className={styles.listPanel}>
          <div className={styles.col}>
            <h3>WHAT WAS BLOCKED</h3>
            <ul className={styles.badList}>
              {overlay.whatWasBlocked.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className={styles.vLine} />
          <div className={styles.col}>
            <h3>SECURE PRACTICES</h3>
            <ul className={styles.goodList}>
              {overlay.securePractices.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        {overlay.realWorldTools.length > 0 && (
          <section className={styles.toolsPanel}>
            <h4>Real-world tools</h4>
            <p>{overlay.realWorldTools.map((tool) => tool.label).slice(0, 3).join(' · ')}</p>
          </section>
        )}

        <section className={styles.chargePanel}>
          <div className={styles.shield}>🛡</div>
          <div className={styles.chargeContent}>
            <h4>SHIELD RECHARGING...</h4>
            <div className={styles.chargeRow}>
              <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${chargePct}%` }} />
              </div>
              <div className={styles.count}>{overlay.timeLeft}s</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
