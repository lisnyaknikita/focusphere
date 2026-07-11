import { db } from '@/lib/appwrite'
import { WeeklyGoal } from '@/shared/types/weekly-goal'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useQuery } from '@tanstack/react-query'

export const useWeeklyGoals = () => {
	const { data: weeklyGoals = [], isLoading, refetch } = useQuery<WeeklyGoal[]>({
		queryKey: ['weekly-goals'],
		queryFn: async () => {
			const userId = await getCurrentUserId()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_WEEKLY_GOALS!,
				queries: [Query.equal('userId', userId), Query.orderAsc('index')],
			})

			return response.rows as unknown as WeeklyGoal[]
		},
	})

	return {
		weeklyGoals,
		isLoading,
		refreshWeeklyGoals: refetch,
	}
}
