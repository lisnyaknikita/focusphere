import { Models } from 'appwrite'

export interface CalendarEvent extends Models.Document {
	title: string
	description?: string
	startDate: string
	endDate: string
	color: string
	userId: string
}

export interface CreateEventPayload {
	title: string
	description?: string
	startDate: string
	endDate: string
	color: string
	userId: string
}

export interface EventForm {
	title: string
	description?: string
	date: string
	startTime: string
	endTime: string
	color: string
}
