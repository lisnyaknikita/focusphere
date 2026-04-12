import { db } from '@/lib/appwrite'
import { deleteEvent } from '@/lib/events/events'
import { CalendarEvent } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Query } from 'appwrite'
import { useEffect } from 'react'

const DB_ID = process.env.NEXT_PUBLIC_DB_ID!
const TABLE_ID = process.env.NEXT_PUBLIC_TABLE_EVENTS!

export const useEvents = () => {
	const queryClient = useQueryClient()

	const query = useQuery({
		queryKey: ['events'],
		queryFn: async () => {
			const userId = await getCurrentUserId()
			const response = await db.listRows({
				databaseId: DB_ID,
				tableId: TABLE_ID,
				queries: [Query.equal('userId', userId), Query.limit(5000)],
			})
			return response.rows as unknown as CalendarEvent[]
		},
		staleTime: 1000 * 60 * 5,
	})

	useEffect(() => {
		const cleanup = async () => {
			const lastCleanup = localStorage.getItem('last_calendar_cleanup')
			const today = new Date().toISOString().split('T')[0]

			if (lastCleanup === today) return

			try {
				const userId = await getCurrentUserId()
				const thirtyDaysAgo = new Date()
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

				const response = await db.listRows({
					databaseId: DB_ID,
					tableId: TABLE_ID,
					queries: [
						Query.equal('userId', userId),
						Query.lessThan('startDate', thirtyDaysAgo.toISOString()),
						Query.limit(100),
						Query.select(['$id']),
					],
				})

				if (response.rows.length > 0) {
					await Promise.allSettled(response.rows.map(event => deleteEvent(event.$id)))
					queryClient.invalidateQueries({ queryKey: ['events'] })
				}

				localStorage.setItem('last_calendar_cleanup', today)
			} catch (error) {
				console.error('[Cleanup Error]:', error)
			}
		}

		cleanup()
	}, [queryClient])

	return query
}
