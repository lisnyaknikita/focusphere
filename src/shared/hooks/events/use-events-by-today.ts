import { getEventsByRange } from '@/lib/events/events'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import 'temporal-polyfill/global'
import { useUser } from '../use-user/use-user'
import { calendarEventsMonthQueryKey, mapGoogleEvent } from './use-calendar-events'

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
	const start = event.startDate.slice(0, 10)
	const end = (event.endDate || event.startDate).slice(0, 10)
	return start <= todayStr && todayStr <= end
}

const fetchAppwriteEventsToday = async (userId: string): Promise<CalendarEvent[]> => {
	const { startOfDay, endOfDay } = getTodayRange()

	const response = await getEventsByRange(userId, startOfDay, endOfDay)
	return response
}

const fetchGoogleEventsToday = async (userId: string): Promise<CalendarEvent[]> => {
	const { startOfDay, endOfDay } = getTodayRange()

	const googleEventsRaw = await googleCalendarService.fetchEvents(new Date(startOfDay), new Date(endOfDay))

	return googleEventsRaw.map((gEvent: GoogleCalendarEvent) => mapGoogleEvent(gEvent, userId)) as CalendarEvent[]
}

export const useEventsByToday = () => {
	const { user, loading: isUserLoading } = useUser()
	const userId = user?.$id
	const queryClient = useQueryClient()

	const cachedMonthData = userId
		? queryClient.getQueryData<CalendarEvent[]>(calendarEventsMonthQueryKey(userId, getCurrentMonthKey())) ?? null
		: null

	const { todayStr } = getTodayRange()
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
		const linkedGoogleIds = new Set(appwriteSource.map(event => event.googleEventId).filter(Boolean))
		const uniqueGoogleEvents = googleEvents.filter(event => !linkedGoogleIds.has(event.googleEventId))
		return [...appwriteSource, ...uniqueGoogleEvents].sort((a, b) => a.startDate.localeCompare(b.startDate))
	}, [appwriteSource, googleEvents])

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
