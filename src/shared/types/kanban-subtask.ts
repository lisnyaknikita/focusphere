import { Models } from 'appwrite'

export type SubtaskStatus = 'todo' | 'done'

export interface KanbanSubtask extends Models.Document {
	taskId: string
	title: string
	status: SubtaskStatus
	assigneeId?: string
	assigneeName?: string
}

export interface CreateSubtaskPayload {
	taskId: string
	title: string
	status: SubtaskStatus
	assigneeId?: string
	assigneeName?: string
}
