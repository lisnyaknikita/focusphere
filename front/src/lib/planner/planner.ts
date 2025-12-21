import { CreateDailyTaskPayload } from '@/shared/types/daily-task'
import { CreateEventPayload } from '@/shared/types/event'
import { Client, ID, TablesDB } from 'appwrite'

const client = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client)

export const createTimeBlock = async (data: CreateEventPayload) => {
	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateTimeBlock = async (eventId: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => {
	return tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
		rowId: eventId,
		data,
	})
}

export const deleteTimeBlock = async (eventId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
		rowId: eventId,
	})
}

export const createDailyTask = async (data: CreateDailyTaskPayload) => {
	return tablesDB.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateDailyTask = async (taskId: string, data: Partial<Omit<CreateDailyTaskPayload, 'userId'>>) => {
	return tablesDB.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		rowId: taskId,
		data,
	})
}

export const deleteDailyTask = async (taskId: string): Promise<void> => {
	await tablesDB.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		rowId: taskId,
	})
}
