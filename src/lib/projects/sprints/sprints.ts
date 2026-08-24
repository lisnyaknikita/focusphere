import { db } from '@/lib/appwrite'
import { deleteKanbanTask, getKanbanTasks, updateKanbanTask } from '@/lib/projects/kanban-board-tasks/tasks'
import { KanbanTask } from '@/shared/types/kanban-task'
import { CreateSprintPayload, Sprint } from '@/shared/types/sprint'
import { ID, Query } from 'appwrite'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const SPRINTS_TABLE = process.env.NEXT_PUBLIC_TABLE_SPRINTS!

export const getSprints = async (projectId: string) => {
	if (!projectId || !SPRINTS_TABLE) return { rows: [] }
	try {
		return await db.listRows({
			databaseId: DB_ID,
			tableId: SPRINTS_TABLE,
			queries: [Query.equal('projectId', projectId), Query.orderDesc('$createdAt')],
		})
	} catch (error) {
		console.error('Failed to get sprints from Appwrite:', error)
		try {
			return await db.listRows({
				databaseId: DB_ID,
				tableId: SPRINTS_TABLE,
				queries: [Query.equal('projectId', projectId)],
			})
		} catch (fallbackErr) {
			console.error('Fallback getSprints also failed:', fallbackErr)
			return { rows: [] }
		}
	}
}

export const createSprint = async (data: CreateSprintPayload) => {
	const payload: Record<string, unknown> = {
		projectId: data.projectId,
		name: data.name,
		startDate: data.startDate,
		endDate: data.endDate,
		status: data.status || 'planned',
	}

	if (data.goal) {
		payload.goal = data.goal
	}

	return db.createRow({
		databaseId: DB_ID,
		tableId: SPRINTS_TABLE,
		rowId: ID.unique(),
		data: payload,
	})
}

export const updateSprint = async (
	sprintId: string,
	data: Partial<CreateSprintPayload & { completedAt?: string | null }>
) => {
	return db.updateRow({
		databaseId: DB_ID,
		tableId: SPRINTS_TABLE,
		rowId: sprintId,
		data,
	})
}

export const deleteSprint = async (sprintId: string, projectId?: string) => {
	if (projectId) {
		try {
			const tasksRes = await getKanbanTasks(projectId)
			const tasks = (tasksRes?.rows || []) as unknown as KanbanTask[]
			const sprintTasks = tasks.filter(t => t.sprintId === sprintId)
			await Promise.all(sprintTasks.map(t => deleteKanbanTask(t.$id)))
		} catch (err) {
			console.error('Failed to cascade delete tasks for sprint:', err)
		}
	}

	return db.deleteRow({
		databaseId: DB_ID,
		tableId: SPRINTS_TABLE,
		rowId: sprintId,
	})
}

export const startSprint = async (projectId: string, sprintId: string) => {
	const sprintsRes = await getSprints(projectId)
	const existingSprints = (sprintsRes?.rows || []) as unknown as Sprint[]
	const currentlyActive = existingSprints.filter(s => s.status === 'active')

	for (const s of currentlyActive) {
		if (s.$id !== sprintId) {
			await updateSprint(s.$id, { status: 'planned' })
		}
	}

	try {
		const tasksRes = await getKanbanTasks(projectId)
		const tasks = (tasksRes?.rows || []) as unknown as KanbanTask[]
		const backlogTasksInSprint = tasks.filter(t => t.sprintId === sprintId && t.status === 'backlog')

		await Promise.all(backlogTasksInSprint.map(t => updateKanbanTask(t.$id, { status: 'todo' })))
	} catch (err) {
		console.error('Failed to update backlog tasks status to todo on startSprint:', err)
	}

	return updateSprint(sprintId, { status: 'active' })
}

export const completeSprint = async (sprintId: string, projectId: string) => {
	return deleteSprint(sprintId, projectId)
}
