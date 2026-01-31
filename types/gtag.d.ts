// Type declarations for Google Analytics gtag

interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string | Date,
    config?: {
      page_path?: string
      event_category?: string
      event_label?: string
      level?: number
      score?: number
      threat_type?: string
      kit_type?: string
      total_kits?: number
      time_spent_seconds?: number
      method?: string
      content_type?: string
      [key: string]: any
    }
  ) => void
  dataLayer: any[]
}
