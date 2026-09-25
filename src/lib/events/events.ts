import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { ID, Query } from 'appwrite'
import { db } from '../appwrite'

const serializeExDates = (exDates?: string[]): string | undefined => {
	if (!exDates || exDates.length === 0) return undefined
	return JSON.stringify(exDates)
}

const deserializeExDates = (raw: unknown): string[] => {
	if (!raw) return []
	if (Array.isArray(raw)) return raw as string[]
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw)
			if (Array.isArray(parsed)) return parsed as string[]
		} catch {
			return raw.trim() ? [raw.trim()] : []
		}
	}
	return []
}

const hydrateEvent = (row: unknown): CalendarEvent => {
	const e = row as CalendarEvent & { recurrenceExDates?: unknown }
	return {
		...e,
		recurrenceExDates: deserializeExDates(e.recurrenceExDates),
	} as CalendarEvent
}

export const createEvent = async (data: CreateEventPayload) => {
	const { recurrenceExDates, ...rest } = data
	return db.createRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: ID.unique(),
		data: {
			...rest,
			source: data.source ?? 'local',
			syncStatus: data.syncStatus ?? 'not_synced',
			...(recurrenceExDates !== undefined && { recurrenceExDates: serializeExDates(recurrenceExDates) }),
		},
	})
}

export const updateEvent = async (eventId: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => {
	const { recurrenceExDates, ...rest } = data
	return db.updateRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: eventId,
		data: {
			...rest,
			...(recurrenceExDates !== undefined && { recurrenceExDates: serializeExDates(recurrenceExDates) }),
		},
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
				'recurrenceRule',
				'recurrenceExDates',
			]),
			Query.orderAsc('startDate'),
			Query.limit(300),
		],
	})

	return (response.rows as unknown[]).map(hydrateEvent)
}

export const getRecurringEvents = async (userId: string) => {
	try {
		const response = await db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
			queries: [
				Query.equal('userId', userId),
				Query.isNotNull('recurrenceRule'),
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
					'recurrenceRule',
					'recurrenceExDates',
				]),
				Query.limit(100),
			],
		})

		return (response.rows as unknown[]).map(hydrateEvent)
	} catch (error) {
		console.warn('Direct recurrence query failed, falling back to user query:', error)
		const response = await db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
			queries: [
				Query.equal('userId', userId),
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
					'recurrenceRule',
					'recurrenceExDates',
				]),
				Query.limit(200),
			],
		})

		return (response.rows as unknown[]).map(hydrateEvent).filter(e => Boolean(e.recurrenceRule))
	}
}

export const addRecurrenceException = async (masterEventId: string, exDate: string) => {
	const doc = await db.getRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		rowId: masterEventId,
	})

	const rawExDates = (doc as unknown as { recurrenceExDates?: unknown }).recurrenceExDates
	const currentExDates: string[] = deserializeExDates(rawExDates)
	if (!currentExDates.includes(exDate)) {
		await updateEvent(masterEventId, {
			recurrenceExDates: [...currentExDates, exDate],
		})
	}
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
