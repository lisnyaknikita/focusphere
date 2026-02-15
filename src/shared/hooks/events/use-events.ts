import { db } from '@/lib/appwrite'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useState } from 'react'

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

	return {
		events,
		getEvents,
		isLoading,
	}
}
