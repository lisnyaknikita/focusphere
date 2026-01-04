import { Models } from 'appwrite'

export interface WeeklyGoal extends Models.Document {
	title: string
	isCompleted: boolean
	userId: string
	index: number
}

export interface WeeklyGoalPayload {
	title: string
	isCompleted: boolean
	userId: string
	index: number
}
