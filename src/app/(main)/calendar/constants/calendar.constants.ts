export type CalendarView = 'month' | 'week' | 'day'

export const VIEW_TO_SX: Record<CalendarView, string> = {
	month: 'month-grid',
	week: 'week',
	day: 'day',
}
