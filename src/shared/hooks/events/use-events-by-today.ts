import { db } from '@/lib/appwrite'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { useQuery } from '@tanstack/react-query'
import { Query } from 'appwrite'
import { useMemo } from 'react'
import 'temporal-polyfill/global'
import { useUser } from '../use-user/use-user'

const reverseColorMap: Record<string, string> = {
	'5': '#D79716',
	'11': '#D71616',
	'10': '#17720F',
	'9': '#1351AE',
	'3': '#97107A',
	'7': '#16ADD7',
}

const getTodayRange = () => {
	const today = Temporal.Now.plainDateISO()
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const startOfDay = today.toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()
	const endOfDay = today.add({ days: 1 }).toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()
	return { startOfDay, endOfDay }
}

const fetchAppwriteEventsToday = async (userId: string): Promise<CalendarEvent[]> => {
	const { startOfDay, endOfDay } = getTodayRange()

	const appwriteRes = await db.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
		queries: [
			Query.equal('userId', userId),
			Query.lessThan('startDate', endOfDay),
			Query.greaterThan('endDate', startOfDay),
			Query.orderAsc('startDate'),
		],
	})

	return appwriteRes.rows as unknown as CalendarEvent[]
}

const fetchGoogleEventsToday = async (userId: string): Promise<CalendarEvent[]> => {
	const { startOfDay, endOfDay } = getTodayRange()

	const googleEventsRaw = await googleCalendarService.fetchEvents(new Date(startOfDay), new Date(endOfDay))

	return googleEventsRaw.map((gEvent: GoogleCalendarEvent) => {
		const isAllDay = !!gEvent.start?.date
		let startDate = gEvent.start?.dateTime ?? ''
		let endDate = gEvent.end?.dateTime ?? ''

		if (isAllDay) {
			startDate = gEvent.start.date!
			const endObj = new Date(gEvent.end.date!)
			endObj.setDate(endObj.getDate() - 1)
			endDate = endObj.toISOString().split('T')[0]
		}

		return {
			$id: `g_${gEvent.id}`,
			$createdAt: new Date().toISOString(),
			$updatedAt: new Date().toISOString(),
			$collectionId: '',
			$databaseId: '',
			$permissions: [],
			$sequence: 0,
			title: gEvent.summary ?? 'Google Event',
			description: gEvent.description ?? '',
			startDate,
			endDate,
			color: gEvent.colorId ? reverseColorMap[gEvent.colorId] ?? '#4285F4' : '#4285F4',
			calendarId: 'google-calendar',
			userId,
		}
	}) as unknown as CalendarEvent[]
}

export const useEventsByToday = () => {
	const { user, loading: isUserLoading } = useUser()
	const userId = user?.$id

	const {
		data: appwriteEvents = [],
		isLoading: isAppwriteLoading,
		refetch: refetchAppwrite,
	} = useQuery({
		queryKey: ['events-today-appwrite'],
		queryFn: () => fetchAppwriteEventsToday(userId!),
		enabled: !!userId,
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

	const events = useMemo(() => {
		return [...appwriteEvents, ...googleEvents].sort((a, b) => a.startDate.localeCompare(b.startDate))
	}, [appwriteEvents, googleEvents])

	const isLoading = isUserLoading || !userId || isAppwriteLoading || isGoogleInitialLoading

	return {
		events,
		isLoading,
		isGoogleLoading: isGoogleLoading,
		refresh: async () => {
			await Promise.all([refetchAppwrite(), refetchGoogle()])
		},
	}
}
