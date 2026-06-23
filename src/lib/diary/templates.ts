import { CreateCustomTemplatePayload, CustomJournalTemplate } from '@/shared/types/journal'
import { ID, Query } from 'appwrite'
import { db } from '../appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_TEMPLATES_ID = process.env.NEXT_PUBLIC_TABLE_JOURNAL_TEMPLATES!

export const getCustomTemplates = async (userId: string): Promise<CustomJournalTemplate[]> => {
	const response = await db.listRows({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		queries: [Query.equal('userId', userId), Query.orderDesc('$updatedAt')],
	})

	return response.rows as unknown as CustomJournalTemplate[]
}

export const createCustomTemplate = async (data: CreateCustomTemplatePayload): Promise<CustomJournalTemplate> => {
	const response = await db.createRow({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		rowId: ID.unique(),
		data,
	})

	return response as unknown as CustomJournalTemplate
}

export const updateCustomTemplate = async (
	templateId: string,
	data: Partial<CreateCustomTemplatePayload>
): Promise<CustomJournalTemplate> => {
	const response = await db.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		rowId: templateId,
		data,
	})

	return response as unknown as CustomJournalTemplate
}

export const deleteCustomTemplate = async (templateId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		rowId: templateId,
	})
}
