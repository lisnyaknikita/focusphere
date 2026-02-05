import { BaseNote, CreateGeneralNotePayload, UpdateGeneralNotePayload } from '@/shared/types/project-note'
import { Client, ID, Query, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_GENERAL_NOTES!

export const getGeneralNotes = async (userId: string): Promise<BaseNote[]> => {
	const response = await tablesDB.listRows({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		queries: [Query.equal('userId', userId), Query.orderDesc('$createdAt')],
	})

	return response.rows as unknown as BaseNote[]
}

export const createGeneralNote = async (data: CreateGeneralNotePayload): Promise<BaseNote> => {
	const response = await tablesDB.createRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ID.unique(),
		data,
	})

	return response as unknown as BaseNote
}

export const updateGeneralNote = async (noteId: string, data: UpdateGeneralNotePayload): Promise<BaseNote> => {
	const response = await tablesDB.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
		data,
	})

	return response as unknown as BaseNote
}

export const deleteGeneralNote = async (noteId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: noteId,
	})
}
