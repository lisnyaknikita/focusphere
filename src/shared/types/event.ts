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
	recurrenceRule?: string
	recurrenceExDates?: string[]
	_masterEventId?: string
	_isRecurrenceInstance?: boolean
	_instanceDate?: string
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
	recurrenceRule?: string
	recurrenceExDates?: string[]
}

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly'

export interface RecurrenceConfig {
	frequency: RecurrenceFrequency
	interval: number
	weekDays?: number[]
	endType: 'never' | 'until' | 'count'
	endDate?: string
	count?: number
}

export interface EventForm {
	title: string
	description?: string
	date: string
	startTime: string
	endTime: string
	color: string
	repeatDays?: number[]
	recurrence?: RecurrenceConfig
}
