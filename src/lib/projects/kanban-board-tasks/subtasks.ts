import { CreateSubtaskPayload } from '@/shared/types/kanban-subtask'
import { Client, ID, Query, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const SUBTASKS_TABLE_ID = process.env.NEXT_PUBLIC_TABLE_KANBAN_SUBTASKS!

export const getKanbanSubtasks = async (taskId: string) => {
	return tablesDB.listRows({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		queries: [Query.equal('taskId', taskId)],
	})
}

export const createKanbanSubtask = async (data: CreateSubtaskPayload) => {
	return tablesDB.createRow({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		rowId: ID.unique(),
		data,
	})
}

export const updateKanbanSubtask = async (subtaskId: string, data: Partial<CreateSubtaskPayload>) => {
	return tablesDB.updateRow({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		rowId: subtaskId,
		data,
	})
}

export const deleteKanbanSubtask = async (subtaskId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		rowId: subtaskId,
	})
}
