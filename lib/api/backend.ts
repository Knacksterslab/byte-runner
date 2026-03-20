// Re-export everything so existing imports stay unchanged.
export type {
  BackendUser,
  Badge,
  UserBadge,
  LeaderboardItem,
  AuthResult,
  Contest,
  ContestLeaderboardEntry,
  PrizeClaim,
  BalanceTransaction,
  BalanceInfo,
  Withdrawal,
  HourlyChallenge,
  HourlyChallengeEligibility,
} from './types'

export {
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  setUsername,
  sendPasswordResetEmail,
  submitPasswordReset,
} from './auth'
export { getLeaderboard } from './leaderboard'
export { submitRun, getMyStats } from './runs'
export { recordShare, getShareCount } from './shares'
export {
  getAllContests,
  getActiveContests,
  getContest,
  getContestLeaderboard,
  enterContest,
  getMyContestEntries,
  getMyClaims,
  getMyClaimForContest,
  submitPrizeClaim,
} from './contests'
export { getAllBadges, getMyBadges, checkBadges, setFeaturedBadge } from './badges'
export {
  getMyBalance,
  getBalanceTransactions,
  submitWithdrawal,
  getMyWithdrawals,
} from './balance'
export {
  getCurrentHourlyChallenge,
  getHourlyChallengeLeaderboard,
  getMyHourlyChallengeEligibility,
} from './hourly'
export { getRecoverySponsor } from './sponsors'
