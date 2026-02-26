import { fetchWithSession } from './client'
import type { BalanceInfo, BalanceTransaction, Withdrawal } from './types'

export async function getMyBalance(): Promise<BalanceInfo> {
  const res = await fetchWithSession('/balance/me', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch balance.')
  return res.json()
}

export async function getBalanceTransactions(
  limit = 50,
  offset = 0,
): Promise<{ transactions: BalanceTransaction[] }> {
  const res = await fetchWithSession(
    `/balance/transactions?limit=${limit}&offset=${offset}`,
    { method: 'GET' },
  )
  if (!res.ok) throw new Error('Failed to fetch transactions.')
  return res.json()
}

export async function submitWithdrawal(
  amountCents: number,
  paymentMethod: string,
  contactInfo: any,
): Promise<Withdrawal> {
  const res = await fetchWithSession('/balance/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amountCents, paymentMethod, contactInfo }),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message || 'Failed to submit withdrawal.')
  }
  return res.json()
}

export async function getMyWithdrawals(): Promise<{ withdrawals: Withdrawal[] }> {
  const res = await fetchWithSession('/balance/withdrawals', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch withdrawals.')
  return res.json()
}
