import { CreateDailyTaskPayload } from '@/shared/types/daily-task'
import { CreateEventPayload } from '@/shared/types/event'
import { WeeklyGoalPayload } from '@/shared/types/weekly-goal'
import { ID } from 'appwrite'
import { db } from '../appwrite'

export const createTimeBlock = async (data: CreateEventPayload) => {
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateTimeBlock = async (eventId: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
		rowId: eventId,
		data,
	})
}

export const deleteTimeBlock = async (eventId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
		rowId: eventId,
	})
}

export const createDailyTask = async (data: CreateDailyTaskPayload) => {
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		rowId: ID.unique(),
		data,
	})
}

export const updateDailyTask = async (taskId: string, data: Partial<Omit<CreateDailyTaskPayload, 'userId'>>) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		rowId: taskId,
		data,
	})
}

export const deleteDailyTask = async (taskId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		rowId: taskId,
	})
}

export const createWeeklyGoal = async (payload: WeeklyGoalPayload) => {
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_WEEKLY_GOALS!,
		rowId: ID.unique(),
		data: payload,
	})
}

export const updateWeeklyGoal = async (goalId: string, data: Partial<WeeklyGoalPayload>) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_WEEKLY_GOALS!,
		rowId: goalId,
		data,
	})
}

export const deleteWeeklyGoal = async (goalId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_WEEKLY_GOALS!,
		rowId: goalId,
	})
}
