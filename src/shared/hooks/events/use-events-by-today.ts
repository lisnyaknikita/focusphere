import { db } from '@/lib/appwrite'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'
import 'temporal-polyfill/global'

export const useEventsByToday = () => {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const fetchEvents = useCallback(async () => {
		setIsLoading(true)
		try {
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

			const reverseColorMap: Record<string, string> = {
				'5': '#D79716',
				'11': '#D71616',
				'10': '#17720F',
				'9': '#1351AE',
				'3': '#97107A',
				'7': '#16ADD7',
			}

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

			setEvents([...appwriteEvents, ...googleEvents])
		} catch (e) {
			console.error(e)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchEvents()
	}, [fetchEvents])

	useEffect(() => {
		const handleRefresh = () => fetchEvents()
		window.addEventListener('refresh-events', handleRefresh)
		return () => window.removeEventListener('refresh-events', handleRefresh)
	}, [fetchEvents])

	return { events, isLoading, refresh: fetchEvents }
}
