import { getEventsByRange, getRecurringEvents } from '@/lib/events/events'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { expandRecurrence } from '@/shared/utils/calendar/recurrence'
import { parseIsoToZonedDateTime } from '@/shared/utils/event-date-time/event-date-time'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import 'temporal-polyfill/global'
import { useUser } from '../use-user/use-user'
import { calendarEventsMonthQueryKey, calendarRecurringEventsQueryKey, mapGoogleEvent } from './use-calendar-events'

const getTodayRange = () => {
	const today = Temporal.Now.plainDateISO()
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const startOfDay = today.toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()
	const endOfDay = today.add({ days: 1 }).toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()
	const todayStr = today.toString()
	return { startOfDay, endOfDay, todayStr }
}

const getCurrentMonthKey = () => {
	const now = new Date()
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const isTodayEvent = (event: CalendarEvent, todayStr: string): boolean => {
	if (event._instanceDate) {
		return event._instanceDate === todayStr
	}
	try {
		const zdt = parseIsoToZonedDateTime(event.startDate)
		const start = 'toPlainDate' in zdt ? zdt.toPlainDate().toString() : zdt.toString()
		const endZdt = event.endDate ? parseIsoToZonedDateTime(event.endDate) : zdt
		const end = 'toPlainDate' in endZdt ? endZdt.toPlainDate().toString() : endZdt.toString()
		return start <= todayStr && todayStr <= end
	} catch {
		const start = event.startDate.slice(0, 10)
		const end = (event.endDate || event.startDate).slice(0, 10)
		return start <= todayStr && todayStr <= end
	}
}

const fetchAppwriteEventsToday = async (userId: string): Promise<CalendarEvent[]> => {
	const { startOfDay, endOfDay } = getTodayRange()

	const response = await getEventsByRange(userId, startOfDay, endOfDay)
	return response
}

const fetchGoogleEventsToday = async (userId: string): Promise<CalendarEvent[]> => {
	const { startOfDay, endOfDay } = getTodayRange()

	const googleEventsRaw = await googleCalendarService.fetchEvents(startOfDay, endOfDay)

	return googleEventsRaw.map((gEvent: GoogleCalendarEvent) => mapGoogleEvent(gEvent, userId)) as CalendarEvent[]
}

export const useEventsByToday = () => {
	const { user, loading: isUserLoading } = useUser()
	const userId = user?.$id
	const queryClient = useQueryClient()

	const cachedMonthData = userId
		? queryClient.getQueryData<CalendarEvent[]>(calendarEventsMonthQueryKey(userId, getCurrentMonthKey())) ?? null
		: null

	const { todayStr, startOfDay, endOfDay } = getTodayRange()
	const cachedTodayEvents = useMemo(() => {
		if (!cachedMonthData) return null
		return cachedMonthData.filter(ev => isTodayEvent(ev, todayStr))
	}, [cachedMonthData, todayStr])

	const {
		data: appwriteEvents = [],
		isLoading: isAppwriteLoading,
		refetch: refetchAppwrite,
	} = useQuery({
		queryKey: ['events-today-appwrite'],
		queryFn: () => fetchAppwriteEventsToday(userId!),
		enabled: !!userId && cachedTodayEvents === null,
		staleTime: 1000 * 60 * 5,
	})

	const { data: recurringEvents = [] } = useQuery({
		queryKey: calendarRecurringEventsQueryKey(userId || ''),
		queryFn: () => getRecurringEvents(userId!),
		enabled: !!userId,
		staleTime: 10 * 60 * 1000,
	})

	const {
		data: googleEvents = [],
		isLoading: isGoogleInitialLoading,
		isFetching: isGoogleLoading,
		refetch: refetchGoogle,
	} = useQuery({
		queryKey: ['events-today-google'],
		queryFn: () => fetchGoogleEventsToday(userId!),
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
	})

	const appwriteSource = cachedTodayEvents !== null ? cachedTodayEvents : appwriteEvents

	const events = useMemo(() => {
		const nonRecurringAppwrite = appwriteSource.filter(e => !e.recurrenceRule)

		const todayStart = new Date(startOfDay)
		const todayEnd = new Date(endOfDay)
		const recurringInstancesToday = recurringEvents.flatMap(rev => expandRecurrence(rev, todayStart, todayEnd))

		const allLocal = [...nonRecurringAppwrite, ...recurringInstancesToday]
		const linkedGoogleIds = new Set<string>()
		for (const event of allLocal) {
			if (event.googleEventId) linkedGoogleIds.add(event.googleEventId)
		}
		for (const event of recurringEvents) {
			if (event.googleEventId) linkedGoogleIds.add(event.googleEventId)
		}

		const isGoogleEventDuplicate = (googleEventId?: string): boolean => {
			if (!googleEventId) return false
			if (linkedGoogleIds.has(googleEventId)) return true
			for (const linkedId of linkedGoogleIds) {
				if (googleEventId.startsWith(linkedId + '_')) return true
			}
			return false
		}

		const uniqueGoogleEvents = googleEvents.filter(event => !isGoogleEventDuplicate(event.googleEventId))

		return [...allLocal, ...uniqueGoogleEvents].sort((a, b) => a.startDate.localeCompare(b.startDate))
	}, [appwriteSource, recurringEvents, googleEvents, startOfDay, endOfDay])

	const isLoading =
		isUserLoading || !userId || (cachedTodayEvents === null && isAppwriteLoading) || isGoogleInitialLoading

	return {
		events,
		isLoading,
		isGoogleLoading: isGoogleLoading,
		refresh: async () => {
			await Promise.all([refetchAppwrite(), refetchGoogle()])
		},
	}
}
