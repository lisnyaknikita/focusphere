import { CreateCustomTemplatePayload, CustomJournalTemplate } from '@/shared/types/journal'
import { Client, ID, Query, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_TEMPLATES_ID = process.env.NEXT_PUBLIC_TABLE_JOURNAL_TEMPLATES!

export const getCustomTemplates = async (userId: string): Promise<CustomJournalTemplate[]> => {
	const response = await tablesDB.listRows({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		queries: [Query.equal('userId', userId), Query.orderDesc('$updatedAt')],
	})

	return response.rows as unknown as CustomJournalTemplate[]
}

export const createCustomTemplate = async (data: CreateCustomTemplatePayload): Promise<CustomJournalTemplate> => {
	const response = await tablesDB.createRow({
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
	const response = await tablesDB.updateRow({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		rowId: templateId,
		data,
	})

	return response as unknown as CustomJournalTemplate
}

export const deleteCustomTemplate = async (templateId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: DB_ID,
		tableId: TABLE_TEMPLATES_ID,
		rowId: templateId,
	})
}
