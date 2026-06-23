import { CreateEventPayload } from '@/shared/types/event'
import { ID } from 'appwrite'
import { db } from '../appwrite'

export const createEvent = async (data: CreateEventPayload) => {
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateEvent = async (eventId: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
		data,
	})
}

export const deleteEvent = async (eventId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
	})
}
