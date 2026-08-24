import { Models } from 'appwrite'

export type SprintStatus = 'planned' | 'active' | 'completed'

export interface Sprint extends Models.Document {
	projectId: string
	name: string
	goal?: string
	startDate: string
	endDate: string
	status: SprintStatus
	completedAt?: string | null
}

export interface CreateSprintPayload {
	projectId: string
	name: string
	goal?: string
	startDate: string
	endDate: string
	status?: SprintStatus
}
