import { db } from '@/lib/appwrite'
import { DailyTask } from '@/shared/types/daily-task'
import { getMonthsInRange } from '@/shared/utils/calendar/calendar-month-range'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { Query } from 'appwrite'
import { useMemo } from 'react'

export const DAILY_TASKS_COUNTERS_KEY = 'daily-tasks-counters-month'

export const dailyTasksCountersMonthQueryKey = (userId: string, monthKey: string) =>
	[DAILY_TASKS_COUNTERS_KEY, userId, monthKey] as const

export const fetchDailyTasksCounters = async (
	userId: string,
	startDate: string,
	endDate: string
): Promise<Record<string, number>> => {
	const response = await db.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
		queries: [
			Query.equal('userId', userId),
			Query.equal('isCompleted', false),
			Query.greaterThanEqual('date', startDate),
			Query.lessThanEqual('date', endDate),
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
}

interface UseDailyTasksCountersProps {
	userId?: string
	start: string
	end: string
}

export const useDailyTasksCounters = ({ userId, start, end }: UseDailyTasksCountersProps) => {
	const queryClient = useQueryClient()
	const monthChunks = useMemo(() => getMonthsInRange(start, end), [start, end])

	const queries = useQueries({
		queries: monthChunks.map(chunk => ({
			queryKey: dailyTasksCountersMonthQueryKey(userId || '', chunk.monthKey),
			queryFn: () => fetchDailyTasksCounters(userId!, chunk.startDay, chunk.endDay),
			enabled: Boolean(userId),
			staleTime: 10 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		})),
	})

	const dailyTasksCountByDate = useMemo(() => {
		const combined: Record<string, number> = {}
		for (const q of queries) {
			if (q.data) {
				Object.assign(combined, q.data)
			}
		}
		return combined
	}, [queries])

	const isLoading = queries.some(q => q.isLoading)

	const refreshDailyTasksCounters = async () => {
		await queryClient.invalidateQueries({ queryKey: [DAILY_TASKS_COUNTERS_KEY] })
	}

	return {
		dailyTasksCountByDate,
		isLoading,
		refreshDailyTasksCounters,
	}
}
