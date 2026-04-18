import { db } from '@/lib/appwrite'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQuery } from '@tanstack/react-query'
import { Query } from 'appwrite'
import 'temporal-polyfill/global'

const reverseColorMap: Record<string, string> = {
	'5': '#D79716',
	'11': '#D71616',
	'10': '#17720F',
	'9': '#1351AE',
	'3': '#97107A',
	'7': '#16ADD7',
}

const fetchEventsByToday = async (): Promise<CalendarEvent[]> => {
	const userId = await getCurrentUserId()
	const today = Temporal.Now.plainDateISO()
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const startOfDay = today.toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()
	const endOfDay = today.add({ days: 1 }).toZonedDateTime({ timeZone }).startOfDay().toInstant().toString()

	const [appwriteRes, googleEventsRaw] = await Promise.all([
		db.listRows({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
			queries: [
				Query.equal('userId', userId),
				Query.lessThan('startDate', endOfDay),
				Query.greaterThan('endDate', startOfDay),
				Query.orderAsc('startDate'),
				Query.limit(5000),
			],
		}),
		googleCalendarService.fetchEvents(new Date(startOfDay), new Date(endOfDay)),
	])

	const appwriteEvents = appwriteRes.rows as unknown as CalendarEvent[]

	const googleEvents: CalendarEvent[] = googleEventsRaw.map((gEvent: GoogleCalendarEvent) => {
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
	})

	return [...appwriteEvents, ...googleEvents]
}

export const useEventsByToday = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['events-today'],
		queryFn: fetchEventsByToday,
		staleTime: 1000 * 60 * 5,
	})

	return {
		events: data ?? [],
		isLoading,
		refresh: async () => {
			await refetch()
		},
	}
}
