import { CreateJournalEntryPayload, JournalEntry, UpdateJournalEntryPayload } from '@/shared/types/journal'
import { ID, Query } from 'appwrite'
import { db } from '../appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_DIARY_NOTES!

export const getDiaryEntries = async (userId: string): Promise<JournalEntry[]> => {
	const response = await db.listRows({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		queries: [Query.equal('userId', userId), Query.orderDesc('$updatedAt')],
	})

	return response.rows as unknown as JournalEntry[]
}

export const createDiaryEntry = async (data: CreateJournalEntryPayload): Promise<JournalEntry> => {
	const response = await db.createRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ID.unique(),
		data,
	})

	return response as unknown as JournalEntry
}

export const updateDiaryEntry = async (noteId: string, data: UpdateJournalEntryPayload): Promise<JournalEntry> => {
	const response = await db.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
		data,
	})

	return response as unknown as JournalEntry
}

export const deleteDiaryEntry = async (noteId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
	})
}
