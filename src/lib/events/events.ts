import { CreateEventPayload } from '@/shared/types/event'
import { Client, ID, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

export const createEvent = async (data: CreateEventPayload) => {
	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateEvent = async (eventId: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => {
	return tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
		data,
	})
}

export const deleteEvent = async (eventId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
	})
}
