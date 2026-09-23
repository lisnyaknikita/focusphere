import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { ID, Query } from 'appwrite'
import { db } from '../appwrite'

export const createEvent = async (data: CreateEventPayload) => {
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: ID.unique(),
		data: {
			...data,
			source: data.source ?? 'local',
			syncStatus: data.syncStatus ?? 'not_synced',
		},
	})
}

export const updateEvent = async (eventId: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => {
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
		data,
	})
}

export const deleteEvent = async (eventId: string): Promise<void> => {
	await db.deleteRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
	})
}

export const getEventsByRange = async (userId: string, visibleStart: string, visibleEnd: string) => {
	const response = await db.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		queries: [
			Query.equal('userId', userId),
			Query.lessThanEqual('startDate', visibleEnd),
			Query.greaterThanEqual('endDate', visibleStart),
			Query.select([
				'$id',
				'$createdAt',
				'$updatedAt',
				'title',
				'description',
				'startDate',
				'endDate',
				'color',
				'calendarId',
				'userId',
				'source',
				'googleEventId',
				'syncStatus',
			]),
			Query.orderAsc('startDate'),
			Query.limit(300),
		],
	})

	return response.rows as unknown as CalendarEvent[]
}

export const copyEvent = async (event: CalendarEvent, startDate: string, endDate: string) =>
	createEvent({
		title: event.title,
		description: event.description,
		startDate,
		endDate,
		color: event.color,
		calendarId: event.calendarId,
		userId: event.userId,
	})

export const createEventCopiesForDays = async (
	event: CalendarEvent,
	copies: Array<{ startDate: string; endDate: string }>
) => Promise.all(copies.map(copy => copyEvent(event, copy.startDate, copy.endDate)))
