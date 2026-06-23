import { db } from '@/lib/appwrite'
import { CreateKanbanTaskPayload } from '@/shared/types/kanban-task'
import { ID, Query } from 'appwrite'
import { deleteKanbanSubtask, getKanbanSubtasks } from './subtasks'

export const getKanbanTasks = async (projectId: string) => {
	return db.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		queries: [Query.equal('projectId', projectId), Query.orderAsc('position')],
	})
}

export const createKanbanTask = async (data: CreateKanbanTaskPayload) => {
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateKanbanTask = async (taskId: string, data: Partial<CreateKanbanTaskPayload>) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		rowId: taskId,
		data,
	})
}

export const deleteKanbanTask = async (taskId: string): Promise<void> => {
	try {
		const subtasksRes = await getKanbanSubtasks(taskId)

		const subtaskPromises = subtasksRes.rows.map(subtask => deleteKanbanSubtask(subtask.$id))

		await Promise.all(subtaskPromises)

		await db.deleteRow({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
			rowId: taskId,
		})
	} catch (error) {
		console.error('Failed to perform cascade delete for task:', error)
		throw error
	}
}

export const updateLegacyTaskNames = async (oldName: string, newName: string) => {
	try {
		const tasks = await db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
			queries: [Query.equal('assigneeName', oldName), Query.limit(100)],
		})

		const promises = tasks.rows.map(task =>
			db.updateRow({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
				rowId: task.$id,
				data: { assigneeName: newName },
			})
		)

		await Promise.all(promises)
		console.log('All legacy task names updated!')
	} catch (err) {
		console.error('Task legacy name migration failed:', err)
	}
}
