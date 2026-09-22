import { CalendarView } from '@/app/(main)/calendar/constants/calendar.constants'
import { getEventsByRange } from '@/lib/events/events'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getMonthsInRange } from '@/shared/utils/calendar/calendar-month-range'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
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
		try {
			const endPlainDate = Temporal.PlainDate.from(endDate).subtract({ days: 1 })
			const startPlainDate = Temporal.PlainDate.from(startDate)
			endDate = Temporal.PlainDate.compare(endPlainDate, startPlainDate) >= 0 ? endPlainDate.toString() : startDate
		} catch {
			const end = new Date(endDate)
			end.setDate(end.getDate() - 1)
			endDate = end.toISOString().slice(0, 10)
		}
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

interface UseCalendarEventsProps {
	userId?: string
	start: string
	end: string
	view?: CalendarView
}

export const useCalendarEvents = ({ userId, start, end }: UseCalendarEventsProps) => {
	const queryClient = useQueryClient()
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

	const googleQueries = useQueries({
		queries: monthChunks.map(chunk => ({
			queryKey: calendarGoogleEventsMonthQueryKey(userId || '', chunk.monthKey),
			queryFn: async () =>
				(await googleCalendarService.fetchEvents(new Date(chunk.startIso), new Date(chunk.endIso))).map(event =>
					mapGoogleEvent(event, userId!)
				),
			enabled: Boolean(userId),
			staleTime: 10 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		})),
	})

	useEffect(() => {
		if (!userId || !monthChunks.length) return
		const firstChunk = monthChunks[0]
		const lastChunk = monthChunks[monthChunks.length - 1]

		const firstDate = new Date(firstChunk.startIso)
		const prevDate = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() - 1, 1))
		const prevKey = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`
		const prevStart = new Date(Date.UTC(prevDate.getUTCFullYear(), prevDate.getUTCMonth(), 1)).toISOString()
		const prevEnd = new Date(
			Date.UTC(prevDate.getUTCFullYear(), prevDate.getUTCMonth() + 1, 0, 23, 59, 59, 999)
		).toISOString()

		const lastDate = new Date(lastChunk.startIso)
		const nextDate = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth() + 1, 1))
		const nextKey = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}`
		const nextStart = new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), 1)).toISOString()
		const nextEnd = new Date(
			Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 0, 23, 59, 59, 999)
		).toISOString()

		queryClient.prefetchQuery({
			queryKey: calendarEventsMonthQueryKey(userId, prevKey),
			queryFn: () => getEventsByRange(userId, prevStart, prevEnd),
			staleTime: 10 * 60 * 1000,
		})
		queryClient.prefetchQuery({
			queryKey: calendarEventsMonthQueryKey(userId, nextKey),
			queryFn: () => getEventsByRange(userId, nextStart, nextEnd),
			staleTime: 10 * 60 * 1000,
		})
	}, [userId, monthChunks, queryClient])

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

		return [...localEvents, ...Array.from(googleEventsMap.values())]
	}, [localQueries, googleQueries])

	const isLoading = localQueries.some(q => q.isLoading) || googleQueries.some(q => q.isLoading)
	const isGoogleLoading = googleQueries.some(q => q.isFetching)

	return {
		events,
		isLoading,
		isGoogleLoading,
	}
}
