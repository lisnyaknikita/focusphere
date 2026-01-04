export interface CalendarItem {
	id: string
	title: string
	start: Date
	end: Date
	color: string
	description?: string
	type: 'event' | 'time-block'
}
