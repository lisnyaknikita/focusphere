import { db } from '@/lib/appwrite'
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

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
				queries: [
					Query.equal('userId', userId),
					Query.lessThan('startDate', endOfDay),
					Query.greaterThan('endDate', startOfDay),
					Query.orderAsc('startDate'),
				],
			})

			setEvents(response.rows as unknown as CalendarEvent[])
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
