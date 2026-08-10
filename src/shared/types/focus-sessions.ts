import { Models } from 'appwrite'

export interface FocusSessionRow extends Models.Document {
	userId: string
	durationMinutes: number
	completedAt: string
}
