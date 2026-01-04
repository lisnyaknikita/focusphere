import { Models } from 'appwrite'

export interface DailyTask extends Models.Document {
	title: string
	date: string
	isCompleted: boolean
	order: number
	userId: string
}

export type CreateDailyTaskPayload = Omit<DailyTask, keyof Models.Document>
