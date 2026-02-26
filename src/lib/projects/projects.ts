import { KanbanTask } from '@/shared/types/kanban-task'
import { CreateProjectPayload, Project } from '@/shared/types/project'
import { Client, ID, Permission, Role, TablesDB } from 'appwrite'
import { deleteKanbanTask, getKanbanTasks } from './kanban-board-tasks/tasks'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

export const createProject = async (data: CreateProjectPayload) => {
	const permissions = [
		Permission.read(Role.user(data.ownerId)),
		Permission.update(Role.user(data.ownerId)),
		Permission.delete(Role.user(data.ownerId)),
	]

	if (data.type === 'team' && data.teamId) {
		permissions.push(Permission.read(Role.team(data.teamId)))
		permissions.push(Permission.update(Role.team(data.teamId)))
	}

	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: ID.unique(),
		data,
		permissions,
	})
}

export const getProjectById = async (projectId: string): Promise<Project> => {
	const response = await tablesDB.getRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: projectId,
	})

	return response as unknown as Project
}

export const updateProject = async (projectId: string, data: Partial<CreateProjectPayload>): Promise<Project> => {
	const response = await tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: projectId,
		data,
	})

	return response as unknown as Project
}

export const deleteProject = async (projectId: string): Promise<Project> => {
	const tasksRes = await getKanbanTasks(projectId)

	const tasks = tasksRes.rows as unknown as KanbanTask[]

	const deleteTasksPromises = tasks.map(task => deleteKanbanTask(task.$id))

	await Promise.all(deleteTasksPromises)

	const response = await tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: projectId,
	})

	return response as unknown as Project
}

export const touchProject = async (projectId: string): Promise<Project> => {
	const response = await tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		rowId: projectId,
		data: {
			lastActivity: new Date().toISOString(),
		},
	})

	return response as unknown as Project
}
