export function generateICS(events: Array<{ title: string; start: string; durationMinutes: number }>): string {
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ARIA//ARIA Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH']
  for (const event of events) {
    const start = new Date(event.start)
    const end = new Date(start.getTime() + event.durationMinutes * 60_000)
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z')
    lines.push('BEGIN:VEVENT',`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${event.title}`,`DESCRIPTION:Scheduled by ARIA`,`UID:aria-${Date.now()}-${Math.random().toString(36).slice(2)}`,'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
