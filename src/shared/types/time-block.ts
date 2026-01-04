import { Models } from 'appwrite'

export interface TimeBlock extends Models.Document {
	title: string
	startDate: string
	endDate: string
	color: string
	calendarId: string
	userId: string
}

export interface TimeBlockPayload {
	title: string
	startDate: string
	endDate: string
	color: string
	calendarId: string
	userId: string
}

export interface TimeBlockForm {
	title: string
	date: string
	startTime: string
	endTime: string
	color: string
}
