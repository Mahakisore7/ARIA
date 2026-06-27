export function isoToRelative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const abs = Math.abs(diff)
  const isPast = diff < 0
  if (abs < 60_000) return isPast ? 'just now' : 'in seconds'
  if (abs < 3_600_000) { const m = Math.round(abs / 60_000); return isPast ? `${m}m ago` : `in ${m}m` }
  if (abs < 86_400_000) { const h = Math.round(abs / 3_600_000); return isPast ? `${h}h ago` : `in ${h}h` }
  const d = Math.round(abs / 86_400_000)
  return isPast ? `${d}d ago` : `in ${d}d`
}

export function minutesToHuman(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function nowPlusMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}
