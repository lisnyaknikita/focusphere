import { db } from '@/lib/appwrite'
import { DailyTask } from '@/shared/types/daily-task'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useDailyTasksCounters = () => {
	const [dailyTasksCountByDate, setDailyTasksCountByDate] = useState<Record<string, number>>({})
	const [isLoading, setIsLoading] = useState(true)

	const getDailyTasksCounters = useCallback(async () => {
		try {
			const userId = await getCurrentUserId()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
				queries: [Query.equal('userId', userId), Query.equal('isCompleted', false)],
			})

			const map: Record<string, number> = {}
			const tasks = response.rows as unknown as DailyTask[]

			for (const row of tasks) {
				map[row.date] = (map[row.date] ?? 0) + 1
			}

			setDailyTasksCountByDate(map)
		} catch (error) {
			console.error('Error fetching daily tasks counters:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		getDailyTasksCounters()
	}, [getDailyTasksCounters])

	return {
		dailyTasksCountByDate,
		isLoading,
		refreshDailyTasksCounters: getDailyTasksCounters,
	}
}
