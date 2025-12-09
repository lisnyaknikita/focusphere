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
