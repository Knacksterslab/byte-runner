import type { Contest } from '@/lib/api/backend'
import { TutorialOverlay } from './TutorialOverlay'
import { StartScreenNew } from './StartScreenNew'
import { AuthModal } from './AuthModal'
import { UsernameModal } from './UsernameModal'

interface StartScreenViewProps {
  tutorialShowing: boolean
  onCloseTutorial: () => void
  onStart: () => void
  onShowTutorial: () => void
  onSignIn?: () => void
  signInLabel?: string
  activeContests: Contest[]
  username?: string
  isAuthenticated: boolean
  onRequestSetUsername: () => void
  showAuthModal: boolean
  authMode: 'signin' | 'signup' | 'forgot'
  authEmail: string
  authPassword: string
  authError: string | null
  authInfo: string | null
  authLoading: boolean
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onSubmitAuth: (event: React.FormEvent<HTMLFormElement>) => void
  onToggleAuthMode: () => void
  onForgotPassword: () => void
  onBackToSignIn: () => void
  onCloseAuthModal: () => void
  showUsernameModal: boolean
  usernameInput: string
  usernameError: string | null
  usernameLoading: boolean
  onUsernameChange: (v: string) => void
  onSubmitUsername: (event: React.FormEvent<HTMLFormElement>) => void
  onCloseUsernameModal: () => void
  dailyChallenge?: import('@/lib/api/daily').DailyChallenge | null
  pointBalance?: number | null
  onPlayDailyIncident?: () => void
}

export function StartScreenView(props: StartScreenViewProps) {
  return (
    <>
      <style jsx>{`
        .start-screen-wrapper { position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          overflow-y: scroll; overflow-x: hidden; -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain; scrollbar-width: none; touch-action: pan-y; }
        .start-screen-wrapper::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div className="start-screen-wrapper">
        <TutorialOverlay showing={props.tutorialShowing} onClose={props.onCloseTutorial} />
        <StartScreenNew
          onStart={props.onStart}
          onShowTutorial={props.onShowTutorial}
          onSignIn={props.onSignIn}
          signInLabel={props.signInLabel}
          activeContests={props.activeContests}
          username={props.username}
          isAuthenticated={props.isAuthenticated}
          onRequestSetUsername={props.onRequestSetUsername}
          dailyChallenge={props.dailyChallenge}
          pointBalance={props.pointBalance}
          onPlayDailyIncident={props.onPlayDailyIncident}
        />
        {props.showAuthModal && (
          <AuthModal
            mode={props.authMode}
            email={props.authEmail}
            password={props.authPassword}
            error={props.authError}
            info={props.authInfo}
            loading={props.authLoading}
            onEmailChange={props.onEmailChange}
            onPasswordChange={props.onPasswordChange}
            onSubmit={props.onSubmitAuth}
            onToggleMode={props.onToggleAuthMode}
            onForgotPassword={props.onForgotPassword}
            onBackToSignIn={props.onBackToSignIn}
            onClose={props.onCloseAuthModal}
          />
        )}
        {props.showUsernameModal && (
          <UsernameModal
            username={props.usernameInput}
            error={props.usernameError}
            loading={props.usernameLoading}
            onUsernameChange={props.onUsernameChange}
            onSubmit={props.onSubmitUsername}
            onClose={props.onCloseUsernameModal}
          />
        )}
      </div>
    </>
  )
}
