import { db } from '@/lib/appwrite'
import { DailyTask } from '@/shared/types/daily-task'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useQuery } from '@tanstack/react-query'

export const useDailyTasksCounters = () => {
	const { data: dailyTasksCountByDate = {}, isLoading, refetch } = useQuery<Record<string, number>>({
		queryKey: ['daily-tasks-counters'],
		queryFn: async () => {
			const userId = await getCurrentUserId()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
				queries: [
					Query.equal('userId', userId),
					Query.equal('isCompleted', false),
					Query.select(['date']),
					Query.limit(500),
				],
			})

			const map: Record<string, number> = {}
			const tasks = response.rows as unknown as DailyTask[]

			for (const row of tasks) {
				map[row.date] = (map[row.date] ?? 0) + 1
			}

			return map
		},
	})

	return {
		dailyTasksCountByDate,
		isLoading,
		refreshDailyTasksCounters: refetch,
	}
}
