import { CreateKanbanTaskPayload } from '@/shared/types/kanban-task'
import { Client, ID, Query, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

export const getKanbanTasks = async (projectId: string) => {
	return tablesDB.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		queries: [Query.equal('projectId', projectId), Query.orderAsc('position')],
	})
}

export const createKanbanTask = async (data: CreateKanbanTaskPayload) => {
	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateKanbanTask = async (taskId: string, data: Partial<CreateKanbanTaskPayload>) => {
	return tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		rowId: taskId,
		data,
	})
}

export const deleteKanbanTask = async (taskId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
		rowId: taskId,
	})
}

export const updateLegacyTaskNames = async (oldName: string, newName: string) => {
	try {
		const tasks = await tablesDB.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_KANBAN_TASKS!,
			queries: [Query.equal('assigneeName', oldName), Query.limit(100)],
		})

		const promises = tasks.rows.map(task =>
			tablesDB.updateRow({
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
