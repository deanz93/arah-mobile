import type { Language } from '@/types'

export function formatDistance(meters: number, lang: Language): string {
  if (meters < 1000) {
    return lang === 'ms' ? `${Math.round(meters)} m` : `${Math.round(meters)} m`
  }
  const km = (meters / 1000).toFixed(1)
  return lang === 'ms' ? `${km} km` : `${km} km`
}

export function formatDuration(seconds: number, lang: Language): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return lang === 'ms' ? `${hours} j ${minutes} min` : `${hours}h ${minutes}min`
  }
  return lang === 'ms' ? `${minutes} min` : `${minutes} min`
}

export function formatTollCost(myr: number): string {
  if (myr === 0) return 'Tiada tol'
  return `RM ${myr.toFixed(2)}`
}

export function formatETA(seconds: number): string {
  const now = new Date()
  const eta = new Date(now.getTime() + seconds * 1000)
  return eta.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
}
