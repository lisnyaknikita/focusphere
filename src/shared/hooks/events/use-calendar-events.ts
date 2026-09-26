import { CalendarView } from '@/app/(main)/calendar/constants/calendar.constants'
import { getEventsByRange, getRecurringEvents } from '@/lib/events/events'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getMonthsInRange } from '@/shared/utils/calendar/calendar-month-range'
import { expandRecurrence } from '@/shared/utils/calendar/recurrence'
import { subtractDaysFromDateString } from '@/shared/utils/event-date-time/event-date-time'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import 'temporal-polyfill/global'

const googleColor: Record<string, string> = {
	'5': '#D79716',
	'11': '#D71616',
	'10': '#17720F',
	'9': '#1351AE',
	'3': '#97107A',
	'7': '#16ADD7',
}

export const mapGoogleEvent = (event: GoogleCalendarEvent, userId: string): CalendarEvent => {
	const allDay = Boolean(event.start.date)
	const startDate = allDay ? event.start.date! : event.start.dateTime || ''
	let endDate = allDay ? event.end.date! : event.end.dateTime || ''

	if (allDay && endDate) {
		const endPlainDateStr = subtractDaysFromDateString(endDate, 1)
		const isEndAfterOrEqualStart =
			Temporal.PlainDate.compare(Temporal.PlainDate.from(endPlainDateStr), Temporal.PlainDate.from(startDate)) >= 0

		endDate = isEndAfterOrEqualStart ? endPlainDateStr : startDate
	}

	return {
		$id: `g_${event.id}`,
		$createdAt: '',
		$updatedAt: '',
		$collectionId: '',
		$databaseId: '',
		$permissions: [],
		$sequence: 0,
		title: event.summary || 'Google Event',
		description: event.description || '',
		startDate,
		endDate,
		color: event.colorId ? googleColor[event.colorId] || '#4285F4' : '#4285F4',
		calendarId: 'google-calendar',
		userId,
		source: 'google',
		googleEventId: event.id,
		syncStatus: 'synced',
	} as CalendarEvent
}

export const calendarEventsMonthQueryKey = (userId: string, monthKey: string) =>
	['calendar-events-month', userId, monthKey] as const

export const calendarGoogleEventsMonthQueryKey = (userId: string, monthKey: string) =>
	['calendar-google-events-month', userId, monthKey] as const

export const calendarRecurringEventsQueryKey = (userId: string) => ['calendar-recurring-events', userId] as const

interface UseCalendarEventsProps {
	userId?: string
	start: string
	end: string
	view?: CalendarView
}

export const useCalendarEvents = ({ userId, start, end }: UseCalendarEventsProps) => {
	const monthChunks = useMemo(() => getMonthsInRange(start, end), [start, end])

	const localQueries = useQueries({
		queries: monthChunks.map(chunk => ({
			queryKey: calendarEventsMonthQueryKey(userId || '', chunk.monthKey),
			queryFn: () => getEventsByRange(userId!, chunk.startIso, chunk.endIso),
			enabled: Boolean(userId),
			staleTime: 10 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		})),
	})

	const recurringQuery = useQuery({
		queryKey: calendarRecurringEventsQueryKey(userId || ''),
		queryFn: () => getRecurringEvents(userId!),
		enabled: Boolean(userId),
		staleTime: 10 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
	})

	const googleQueries = useQueries({
		queries: monthChunks.map(chunk => ({
			queryKey: calendarGoogleEventsMonthQueryKey(userId || '', chunk.monthKey),
			queryFn: async () =>
				(await googleCalendarService.fetchEvents(chunk.startIso, chunk.endIso)).map(event =>
					mapGoogleEvent(event, userId!)
				),
			enabled: Boolean(userId),
			staleTime: 10 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		})),
	})

	const events = useMemo(() => {
		const localEventsMap = new Map<string, CalendarEvent>()
		for (const q of localQueries) {
			if (q.data) {
				for (const event of q.data) {
					localEventsMap.set(event.$id, event)
				}
			}
		}

		const localEvents = Array.from(localEventsMap.values())
		const nonRecurringEvents = localEvents.filter(e => !e.recurrenceRule)

		const recurringMastersMap = new Map<string, CalendarEvent>()
		if (recurringQuery.data) {
			for (const rev of recurringQuery.data) {
				recurringMastersMap.set(rev.$id, rev)
			}
		}
		for (const lev of localEvents) {
			if (lev.recurrenceRule) {
				recurringMastersMap.set(lev.$id, lev)
			}
		}

		const rangeStart = new Date(start)
		const rangeEnd = new Date(end)
		const expandedInstances = Array.from(recurringMastersMap.values()).flatMap(master =>
			expandRecurrence(master, rangeStart, rangeEnd)
		)

		const linkedGoogleIds = new Set(localEvents.map(event => event.googleEventId).filter(Boolean))

		const googleEventsMap = new Map<string, CalendarEvent>()
		for (const q of googleQueries) {
			if (q.data) {
				for (const event of q.data) {
					if (!linkedGoogleIds.has(event.googleEventId)) {
						googleEventsMap.set(event.$id, event)
					}
				}
			}
		}

		return [...nonRecurringEvents, ...expandedInstances, ...Array.from(googleEventsMap.values())]
	}, [localQueries, recurringQuery.data, googleQueries, start, end])

	const isLoading =
		localQueries.some(q => q.isLoading) || recurringQuery.isLoading || googleQueries.some(q => q.isLoading)
	const isGoogleLoading = googleQueries.some(q => q.isFetching)

	return {
		events,
		isLoading,
		isGoogleLoading,
	}
}
