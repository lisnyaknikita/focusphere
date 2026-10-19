import { CalendarView } from '@/app/(main)/calendar/constants/calendar.constants'
import { CALENDAR_COLORS, getCalendarIdByColor } from '@/lib/events/calendar-config'
import { getEventsByRange, getRecurringEvents } from '@/lib/events/events'
import { calendarKeys } from '@/shared/constants/query-keys'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getMonthsInRange } from '@/shared/utils/calendar/calendar-month-range'
import { expandRecurrence } from '@/shared/utils/calendar/recurrence'
import { subtractDaysFromDateString } from '@/shared/utils/event-date-time/event-date-time'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import 'temporal-polyfill/global'

const googleColorMap: Record<string, string> = {
	'1': CALENDAR_COLORS.PURPLE,
	'2': CALENDAR_COLORS.GREEN,
	'3': CALENDAR_COLORS.PURPLE,
	'4': CALENDAR_COLORS.RED,
	'5': CALENDAR_COLORS.GOLD,
	'6': CALENDAR_COLORS.RED,
	'7': CALENDAR_COLORS.CYAN,
	'8': CALENDAR_COLORS.BLUE,
	'9': CALENDAR_COLORS.BLUE,
	'10': CALENDAR_COLORS.GREEN,
	'11': CALENDAR_COLORS.RED,
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

	const color = event.colorId ? googleColorMap[event.colorId] || CALENDAR_COLORS.BLUE : CALENDAR_COLORS.BLUE

	const calendarId = getCalendarIdByColor(color)

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
		color,
		calendarId,
		userId,
		source: 'google',
		googleEventId: event.id,
		syncStatus: 'synced',
	} as CalendarEvent
}

export const calendarEventsMonthQueryKey = (userId: string, monthKey: string) =>
	calendarKeys.localMonth(userId, monthKey)

export const calendarGoogleEventsMonthQueryKey = (userId: string, monthKey: string) =>
	calendarKeys.googleMonth(userId, monthKey)

export const calendarRecurringEventsQueryKey = (userId: string) => calendarKeys.recurring(userId)

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
			queryKey: calendarKeys.localMonth(userId || '', chunk.monthKey),
			queryFn: () => getEventsByRange(userId!, chunk.startIso, chunk.endIso),
			enabled: Boolean(userId),
			staleTime: 10 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		})),
	})

	const recurringQuery = useQuery({
		queryKey: calendarKeys.recurring(userId || ''),
		queryFn: () => getRecurringEvents(userId!),
		enabled: Boolean(userId),
		staleTime: 10 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
	})

	const googleQueries = useQueries({
		queries: monthChunks.map(chunk => ({
			queryKey: calendarKeys.googleMonth(userId || '', chunk.monthKey),
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
