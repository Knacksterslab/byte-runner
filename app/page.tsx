import SimpleGame from '@/components/game/SimpleGame'
import CyberspaceBackground from '@/components/CyberspaceBackground'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <CyberspaceBackground />
      <SimpleGame />
    </>
  )
}
