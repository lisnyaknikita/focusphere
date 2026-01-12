import { Models } from 'appwrite'

export type TaskStatus = 'todo' | 'inprogress' | 'done'

export interface KanbanTask extends Models.Document {
	title: string
	description?: string
	status: TaskStatus
	projectId: string
	assigneeName: string
}

export interface CreateKanbanTaskPayload {
	title: string
	description?: string
	status: TaskStatus
	projectId: string
	assigneeName: string
}
