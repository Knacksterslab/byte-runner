export interface BackendUser {
  id: string
  username: string | null
  email: string | null
  continueTokens: number
  featuredBadge: string | null
  createdAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  category: 'achievement' | 'social' | 'contest' | 'skill'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  requirement_type: string
  requirement_value: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badges: Badge
}

export interface LeaderboardItem {
  username: string
  score: number
  distance: number
  createdAt: string
  featuredBadge?: string | null
  badgeEmoji?: string | null
}

export interface AuthResult {
  status:
    | 'OK'
    | 'FIELD_ERROR'
    | 'WRONG_CREDENTIALS_ERROR'
    | 'SIGN_IN_NOT_ALLOWED'
    | 'SIGN_UP_NOT_ALLOWED'
  message?: string
  formFields?: Array<{ id: string; error?: string }>
}

export interface Contest {
  id: string
  name: string
  slug: string
  description: string | null
  start_date: string
  end_date: string
  contest_timezone: string
  status: 'upcoming' | 'active' | 'ended' | 'cancelled'
  prize_pool: Record<string, string> | null
  rules: Record<string, any> | null
  max_entries_per_user: number
  created_at: string
  updated_at: string
}

export interface ContestLeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  distance: number
  createdAt: string
}

export interface PrizeClaim {
  id: string
  contest_id: string
  rank: number
  prize_description: string
  claim_status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'paid'
  contact_info: any
  submitted_at: string | null
  created_at: string
}

export interface BalanceTransaction {
  id: string
  amountCents: number
  type: string
  description: string
  createdAt: string
}

export interface BalanceInfo {
  balanceCents: number
  pendingWithdrawalsCents: number
  totalEarnedCents: number
  recentTransactions: BalanceTransaction[]
}

export interface Withdrawal {
  id: string
  userId?: string
  amountCents: number
  paymentMethod: string
  contactInfo?: Record<string, any>
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'failed'
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
  paymentDetails: string | null
  transactionId: string | null
  createdAt?: string
}

export interface HourlyChallenge {
  id: string
  challengeHour: string
  status: string
  winnerUserId: string | null
  winnerScore: number | null
  winnerDistance: number | null
}

export interface HourlyChallengeEligibility {
  eligible: boolean
  reason?: string
  fraudScore: number
  flags: string[]
  requirements: {
    minAccountAgeHours: number
    minRuns: number
    maxDailyWins: number
  }
  progress: {
    accountAgeHours: number
    totalRuns: number
    winsToday: number
  }
  nextEligibleAt: string | null
}
