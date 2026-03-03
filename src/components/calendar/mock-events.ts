/**
 * Mock calendar events — placeholder data for future Google Calendar integration.
 * The CalendarEvent interface is designed to map to Google Calendar API responses.
 */

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: string      // Hex color, defaults to --accent (#007AFF)
  allDay?: boolean
  location?: string
  description?: string
}

/** Create a Date relative to today with a given day offset and time. */
function eventDate(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    start: eventDate(0, 9, 0),
    end: eventDate(0, 9, 30),
    color: '#007AFF',
  },
  {
    id: '2',
    title: 'Lunch with Alex',
    start: eventDate(0, 12, 0),
    end: eventDate(0, 13, 0),
    color: '#34C759',
    location: 'Café Gratitude',
  },
  {
    id: '3',
    title: 'Sprint Planning',
    start: eventDate(0, 15, 0),
    end: eventDate(0, 16, 0),
    color: '#5856D6',
  },
  {
    id: '4',
    title: 'Dentist Appointment',
    start: eventDate(1, 14, 0),
    end: eventDate(1, 15, 0),
    color: '#FF9500',
    location: 'Downtown Dental',
  },
  {
    id: '5',
    title: 'Game Night',
    start: eventDate(2, 19, 0),
    end: eventDate(2, 22, 0),
    color: '#FF3B30',
  },
  {
    id: '6',
    title: 'Grocery Run',
    start: eventDate(3, 10, 0),
    end: eventDate(3, 11, 0),
    color: '#34C759',
  },
  {
    id: '7',
    title: 'Weekend Hike',
    start: eventDate(5, 8, 0),
    end: eventDate(5, 12, 0),
    color: '#5AC8FA',
    location: 'Runyon Canyon',
  },
]
