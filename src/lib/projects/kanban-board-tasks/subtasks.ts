import { db } from '@/lib/appwrite'
import { CreateSubtaskPayload } from '@/shared/types/kanban-subtask'
import { ID, Query } from 'appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const SUBTASKS_TABLE_ID = process.env.NEXT_PUBLIC_TABLE_KANBAN_SUBTASKS!

export const getKanbanSubtasks = async (taskId: string) => {
	return db.listRows({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		queries: [Query.equal('taskId', taskId)],
	})
}

export const createKanbanSubtask = async (data: CreateSubtaskPayload) => {
	return db.createRow({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		rowId: ID.unique(),
		data,
	})
}

export const updateKanbanSubtask = async (subtaskId: string, data: Partial<CreateSubtaskPayload>) => {
	return db.updateRow({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		rowId: subtaskId,
		data,
	})
}

export const deleteKanbanSubtask = async (subtaskId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: DB_ID,
		tableId: SUBTASKS_TABLE_ID,
		rowId: subtaskId,
	})
}
