import { CreateProjectPayload, Project } from '@/shared/types/project'
import { Client, ID, Permission, Role, TablesDB } from 'appwrite'
import { teams } from '../appwrite'
import { deleteChannel, getChannels } from './chat/chat'
import { deleteKanbanTask, getKanbanTasks } from './kanban-board-tasks/tasks'
import { deleteProjectNote, getProjectNotes } from './project-notes/notes'

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
		data: {
			...data,
			isFavorite: false,
		},
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
	try {
		const [tasksRes, notes, channelsRes] = await Promise.all([
			getKanbanTasks(projectId),
			getProjectNotes(projectId),
			getChannels(projectId),
		])

		const taskPromises = tasksRes.rows.map(task => deleteKanbanTask(task.$id))

		const notePromises = notes.map(note => deleteProjectNote(projectId, note.$id))

		const channelPromises = channelsRes.rows.map(channel => deleteChannel(channel.$id))

		await Promise.all([...taskPromises, ...notePromises, ...channelPromises])

		console.log(`Cascade delete finished for project: ${projectId}`)

		const response = await tablesDB.deleteRow({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
			rowId: projectId,
		})

		return response as unknown as Project
	} catch (error) {
		console.error('Failed to perform cascade delete for project:', error)
		throw error
	}
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

export const getTeamMembersCount = async (teamId: string) => {
	try {
		const response = await teams.listMemberships(teamId)
		return response.total
	} catch (error) {
		console.error('Failed to fetch team members count:', error)
		return 1
	}
}

export const convertToTeamProject = async (projectId: string, ownerId: string, projectTitle: string) => {
	try {
		const team = await teams.create(ID.unique(), `${projectTitle} Team`)

		const updatedProject = await tablesDB.updateRow({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
			rowId: projectId,
			data: {
				type: 'team',
				teamId: team.$id,
			},
			permissions: [
				Permission.read(Role.user(ownerId)),
				Permission.update(Role.user(ownerId)),
				Permission.delete(Role.user(ownerId)),
				Permission.read(Role.team(team.$id)),
				Permission.update(Role.team(team.$id)),
			],
		})

		return updatedProject
	} catch (error) {
		console.error('Conversion failed:', error)
		throw error
	}
}
