/**
 * Weak-password content for the typing drill, with the reason each is weak —
 * the reason IS the lesson shown beside the password.
 */
export interface WeakPassword {
  value: string
  why: string
}

export const WEAK_PASSWORDS: WeakPassword[] = [
  { value: 'password', why: 'the #1 most-used password on Earth' },
  { value: '12345678', why: 'straight digits — cracked in seconds' },
  { value: 'qwerty', why: 'keyboard walk, top of every wordlist' },
  { value: 'letmein', why: 'classic movie line, classic wordlist entry' },
  { value: 'admin2024', why: 'role + year — the pattern bots try first' },
  { value: 'bob1990', why: 'name + birth year = public info' },
  { value: 'Passw0rd!', why: 'leetspeak of "password" adds nothing' },
  { value: 'iloveyou', why: 'top-10 password since the 90s' },
  { value: 'dragon', why: 'short and famous — 6 chars fall in minutes' },
  { value: 'monkey123', why: 'pet name + digits' },
  { value: 'welcome1', why: 'default corporate password everywhere' },
  { value: 'abc12345', why: 'sequence + digits, zero entropy' },
  { value: 'sunshine', why: 'single dictionary word' },
  { value: 'princess', why: 'single dictionary word' },
  { value: 'football1', why: 'sport + digit, in every breach dump' },
  { value: 'P@ssword1', why: 'symbol-swaps are already in wordlists' },
]
