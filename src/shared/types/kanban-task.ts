import { Models } from 'appwrite'

export type TaskStatus = string
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface KanbanTask extends Models.Document {
	title: string
	description?: string
	status: TaskStatus
	priority: TaskPriority
	projectId: string
	assigneeName: string
	assigneeId?: string
	position: number
	labels?: string[]
	taskCode: string
}

export interface CreateKanbanTaskPayload {
	title: string
	description?: string
	status: TaskStatus
	priority: TaskPriority
	projectId: string
	assigneeName: string
	assigneeId?: string
	position: number
	labels?: string[]
	taskCode: string
}
