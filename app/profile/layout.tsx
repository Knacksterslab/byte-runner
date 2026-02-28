import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Profile | Byte Runner',
  description: 'View your Byte Runner stats, badges, and earnings. Track your best score, rank, and cybersecurity learning progress.',
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
