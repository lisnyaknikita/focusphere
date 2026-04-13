import { db } from '@/lib/appwrite'
import { deleteEvent } from '@/lib/events/events'
import { GoogleCalendarEvent, googleCalendarService } from '@/shared/services/google-calendar.service'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useEvents = () => {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const getEvents = useCallback(async () => {
		const userId = await getCurrentUserId()

		const filters = [Query.equal('userId', userId), Query.limit(5000)]

		setIsLoading(true)

		try {
			const timeMin = new Date()
			timeMin.setMonth(timeMin.getMonth() - 2)
			const timeMax = new Date()
			timeMax.setMonth(timeMax.getMonth() + 3)

			const [appwriteRes, googleEventsRaw] = await Promise.all([
				db.listRows({
					databaseId: process.env.NEXT_PUBLIC_DB_ID!,
					tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
					queries: filters,
				}),
				googleCalendarService.fetchEvents(timeMin, timeMax),
			])

			const appwriteEvents = appwriteRes.rows as unknown as CalendarEvent[]

			const googleEvents: CalendarEvent[] = googleEventsRaw.map((gEvent: GoogleCalendarEvent) => {
				const isAllDay = !!gEvent.start?.date
				let startDate = gEvent.start?.dateTime || ''
				let endDate = gEvent.end?.dateTime || ''

				if (isAllDay) {
					startDate = gEvent.start.date!

					const endObj = new Date(gEvent.end.date!)
					endObj.setDate(endObj.getDate() - 1)
					endDate = endObj.toISOString().split('T')[0]
				}

				const reverseColorMap: Record<string, string> = {
					'5': '#D79716',
					'11': '#D71616',
					'10': '#17720F',
					'9': '#1351AE',
					'3': '#97107A',
					'7': '#16ADD7',
				}

				return {
					$id: `g_${gEvent.id}`,
					$createdAt: new Date().toISOString(),
					$updatedAt: new Date().toISOString(),
					$collectionId: '',
					$databaseId: '',
					$permissions: [],
					$sequence: 0,
					title: gEvent.summary || 'Google Event',
					description: gEvent.description || '',
					startDate,
					endDate,
					color: gEvent.colorId ? reverseColorMap[gEvent.colorId] || '#4285F4' : '#4285F4',
					calendarId: 'google-calendar',
					userId: userId,
				}
			}) as unknown as CalendarEvent[]

			setEvents([...appwriteEvents, ...googleEvents])
		} catch (error) {
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	const cleanupOldEvents = useCallback(async () => {
		const lastCleanup = localStorage.getItem('last_calendar_cleanup')
		const today = new Date().toISOString().split('T')[0]

		if (lastCleanup === today) return

		try {
			const userId = await getCurrentUserId()

			const thirtyDaysAgo = new Date()
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

			const thresholdDate = thirtyDaysAgo.toISOString()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
				queries: [
					Query.equal('userId', userId),
					Query.lessThan('startDate', thresholdDate),
					Query.limit(100),
					Query.select(['$id']),
				],
			})

			if (response.rows.length > 0) {
				await Promise.allSettled(response.rows.map(event => deleteEvent(event.$id)))
				console.log(`[Cleanup] Deleted calendar events: ${response.rows.length}`)
			}

			localStorage.setItem('last_calendar_cleanup', today)
		} catch (error) {
			console.error('[Cleanup Error]:', error)
		}
	}, [])

	useEffect(() => {
		cleanupOldEvents()
	}, [cleanupOldEvents])

	return {
		events,
		getEvents,
		isLoading,
	}
}
