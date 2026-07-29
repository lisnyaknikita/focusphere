import { CreateQuickIdeaPayload, QuickIdea } from '@/shared/types/quick-idea'
import { ID, Query } from 'appwrite'
import { db } from '../appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_QUICK_IDEAS!

export const getQuickIdeas = async (userId: string): Promise<QuickIdea[]> => {
	const response = await db.listRows({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		queries: [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(100)],
	})

	return response.rows as unknown as QuickIdea[]
}

export const createQuickIdea = async (data: CreateQuickIdeaPayload): Promise<QuickIdea> => {
	const response = await db.createRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ID.unique(),
		data,
	})

	return response as unknown as QuickIdea
}

export const updateQuickIdea = async (
	ideaId: string,
	data: Partial<Omit<CreateQuickIdeaPayload, 'userId'>>
): Promise<QuickIdea> => {
	const response = await db.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ideaId,
		data,
	})

	return response as unknown as QuickIdea
}

export const deleteQuickIdea = async (ideaId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_ID,
		rowId: ideaId,
	})
}
