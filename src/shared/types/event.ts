import { Models } from 'appwrite'

export type EventSource = 'local' | 'google'
export type EventSyncStatus = 'not_synced' | 'pending' | 'synced' | 'failed'

export interface CalendarEvent extends Models.Document {
	title: string
	description?: string
	startDate: string
	endDate: string
	color: string
	calendarId: string
	userId: string
	source?: EventSource
	googleEventId?: string
	syncStatus?: EventSyncStatus
}

export interface CreateEventPayload {
	title: string
	description?: string
	startDate: string
	endDate: string
	color: string
	calendarId: string
	userId: string
	source?: EventSource
	googleEventId?: string
	syncStatus?: EventSyncStatus
}

export interface EventForm {
	title: string
	description?: string
	date: string
	startTime: string
	endTime: string
	color: string
	repeatDays?: number[]
}
