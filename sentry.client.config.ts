import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set sample rate to capture errors
  // In production, you might want to reduce this to 10% (0.1) to save quota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configure the environment
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  
  // Capture React component errors
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Session Replay sample rate
  // This captures session recordings to help debug issues
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Ignore common non-critical errors
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Network errors (user offline)
    'NetworkError',
    'Failed to fetch',
  ],
  
  // Add custom tags
  beforeSend(event, hint) {
    // Add game-specific context
    if (event.contexts) {
      event.contexts.game = {
        version: '0.1.0',
      }
    }
    return event
  },
})
