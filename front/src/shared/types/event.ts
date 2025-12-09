import { Models } from 'appwrite'

export interface CalendarEvent extends Models.Document {
	title: string
	description?: string
	startDate: string
	endDate: string
	color: string
	userId: string
}
