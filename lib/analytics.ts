// Google Analytics 4 event tracking helpers

// Check if GA is available
export const isGAEnabled = () => {
  return typeof window !== 'undefined' && 
         typeof window.gtag !== 'undefined' && 
         process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
}

// Track page views
export const trackPageView = (url: string) => {
  if (isGAEnabled()) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

// Game Events
export const trackGameStart = () => {
  if (isGAEnabled()) {
    window.gtag('event', 'game_start', {
      event_category: 'game',
      event_label: 'user_started_game'
    })
  }
}

export const trackGameOver = (level: number, score: number, threatType: string) => {
  if (isGAEnabled()) {
    window.gtag('event', 'game_over', {
      event_category: 'game',
      level: level,
      score: score,
      threat_type: threatType,
      event_label: `died_at_level_${level}`
    })
  }
}

export const trackLevelUp = (level: number) => {
  if (isGAEnabled()) {
    window.gtag('event', 'level_up', {
      event_category: 'progression',
      level: level,
      event_label: `reached_level_${level}`
    })
  }
}

export const trackKitCollected = (kitType: string, totalKits: number) => {
  if (isGAEnabled()) {
    window.gtag('event', 'kit_collected', {
      event_category: 'collection',
      kit_type: kitType,
      total_kits: totalKits,
      event_label: `collected_${kitType}`
    })
  }
}

// Quiz Events
export const trackQuizAttempt = (kitType: string) => {
  if (isGAEnabled()) {
    window.gtag('event', 'quiz_attempt', {
      event_category: 'quiz',
      kit_type: kitType,
      event_label: `quiz_started_${kitType}`
    })
  }
}

export const trackQuizPass = (kitType: string) => {
  if (isGAEnabled()) {
    window.gtag('event', 'quiz_pass', {
      event_category: 'quiz',
      kit_type: kitType,
      event_label: `quiz_passed_${kitType}`
    })
  }
}

export const trackQuizFail = (kitType: string) => {
  if (isGAEnabled()) {
    window.gtag('event', 'quiz_fail', {
      event_category: 'quiz',
      kit_type: kitType,
      event_label: `quiz_failed_${kitType}`
    })
  }
}

// Tutorial Events
export const trackTutorialViewed = () => {
  if (isGAEnabled()) {
    window.gtag('event', 'tutorial_viewed', {
      event_category: 'onboarding',
      event_label: 'tutorial_displayed'
    })
  }
}

export const trackTutorialDismissed = (timeSpent: number) => {
  if (isGAEnabled()) {
    window.gtag('event', 'tutorial_dismissed', {
      event_category: 'onboarding',
      time_spent_seconds: Math.round(timeSpent / 1000),
      event_label: 'tutorial_closed'
    })
  }
}

// Social Events
export const trackSocialShare = (platform: string, score: number) => {
  if (isGAEnabled()) {
    window.gtag('event', 'share', {
      event_category: 'social',
      method: platform,
      content_type: 'score',
      score: score,
      event_label: `shared_to_${platform}`
    })
  }
}

// Feedback Events
export const trackFeedbackClick = () => {
  if (isGAEnabled()) {
    window.gtag('event', 'feedback_click', {
      event_category: 'engagement',
      event_label: 'feedback_button_clicked'
    })
  }
}

// Education Events
export const trackEducationExpanded = (kitType: string) => {
  if (isGAEnabled()) {
    window.gtag('event', 'education_expanded', {
      event_category: 'learning',
      kit_type: kitType,
      event_label: `learned_about_${kitType}`
    })
  }
}

export const trackDeepDiveViewed = (kitType: string) => {
  if (isGAEnabled()) {
    window.gtag('event', 'deep_dive_viewed', {
      event_category: 'learning',
      kit_type: kitType,
      event_label: `deep_dive_${kitType}`
    })
  }
}
