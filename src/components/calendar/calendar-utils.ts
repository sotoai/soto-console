/**
 * Calendar utility functions — pure helpers, no React.
 */

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export { DAY_NAMES, MONTH_NAMES }

/** Get 7 consecutive Date objects starting from the Monday of the given date's week. */
export function getWeekDays(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay()
  // JS getDay(): 0=Sun,1=Mon,...6=Sat → shift so Mon=0
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const copy = new Date(d)
    copy.setDate(d.getDate() + i)
    return copy
  })
}

/** Build a 6×7 grid for a calendar month. Cells outside the month are null. */
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const grid: (Date | null)[][] = []
  let dayCounter = 1 - startDow

  for (let week = 0; week < 6; week++) {
    const row: (Date | null)[] = []
    for (let col = 0; col < 7; col++) {
      if (dayCounter >= 1 && dayCounter <= daysInMonth) {
        row.push(new Date(year, month, dayCounter))
      } else {
        row.push(null)
      }
      dayCounter++
    }
    grid.push(row)
  }

  return grid
}

/** Get all 12 months for a given year with their grids. */
export function getMonthsOfYear(year: number) {
  return MONTH_NAMES.map((name, i) => ({
    name,
    month: i,
    days: getMonthGrid(year, i),
  }))
}

/** Check if a date is today. */
export function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

/** Check if two dates are in the same month and year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** Format a date as a time string (e.g., "3:45 PM"). */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Get the 1-based day-of-year for a date. */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/** Check if a year is a leap year. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** Total days in a year. */
export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}
