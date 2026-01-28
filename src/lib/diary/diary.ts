import { CreateJournalEntryPayload, JournalEntry, UpdateJournalEntryPayload } from '@/shared/types/journal'
import { Client, ID, Query, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_DIARY_NOTES!

export const getDiaryEntries = async (userId: string): Promise<JournalEntry[]> => {
	const response = await tablesDB.listRows({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		queries: [Query.equal('userId', userId), Query.orderDesc('$createdAt')],
	})

	return response.rows as unknown as JournalEntry[]
}

export const createDiaryEntry = async (data: CreateJournalEntryPayload): Promise<JournalEntry> => {
	const response = await tablesDB.createRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ID.unique(),
		data,
	})

	return response as unknown as JournalEntry
}

export const updateDiaryEntry = async (noteId: string, data: UpdateJournalEntryPayload): Promise<JournalEntry> => {
	const response = await tablesDB.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
		data,
	})

	return response as unknown as JournalEntry
}

export const deleteDiaryEntry = async (noteId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
	})
}
