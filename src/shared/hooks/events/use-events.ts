import { db } from '@/lib/appwrite'
import { deleteEvent } from '@/lib/events/events'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useEvents = () => {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const getEvents = useCallback(async () => {
		const userId = await getCurrentUserId()

		const filters = [Query.equal('userId', userId)]

		setIsLoading(true)

		try {
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
				queries: filters,
			})

			const typedEvents = response.rows as unknown as CalendarEvent[]

			setEvents(typedEvents)
		} catch (error) {
			if (error instanceof Error) {
				console.error(error)
			}
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
