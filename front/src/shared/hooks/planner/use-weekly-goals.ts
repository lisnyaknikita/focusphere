import { db } from '@/lib/appwrite'
import { WeeklyGoal } from '@/shared/types/weekly-goal'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useWeeklyGoals = () => {
	const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const getWeeklyGoals = useCallback(async () => {
		try {
			const userId = await getCurrentUserId()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_WEEKLY_GOALS!,
				queries: [Query.equal('userId', userId), Query.orderAsc('index')],
			})

			setWeeklyGoals(response.rows as unknown as WeeklyGoal[])
		} catch (error) {
			console.error('Error fetching weekly goals:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		getWeeklyGoals()
	}, [getWeeklyGoals])

	return {
		weeklyGoals,
		isLoading,
		refreshWeeklyGoals: getWeeklyGoals,
	}
}
