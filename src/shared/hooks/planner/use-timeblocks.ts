import { db } from '@/lib/appwrite'
import { deleteTimeBlock } from '@/lib/planner/planner'
import { TimeBlock } from '@/shared/types/time-block'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useTimeBlocks = () => {
	const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const getTimeBlocks = useCallback(async () => {
		try {
			const userId = await getCurrentUserId()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
				queries: [Query.equal('userId', userId)],
			})

			setTimeBlocks(response.rows as unknown as TimeBlock[])
		} catch (error) {
			console.error('Error fetching time blocks:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	const cleanupOldTimeBlocks = useCallback(async () => {
		const lastCleanup = localStorage.getItem('last_timeblocks_cleanup')
		const today = new Date().toISOString().split('T')[0]

		if (lastCleanup === today) return

		try {
			const userId = await getCurrentUserId()

			const thirtyDaysAgo = new Date()
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

			const thresholdDate = thirtyDaysAgo.toISOString()

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_TIMEBLOCKS!,
				queries: [
					Query.equal('userId', userId),
					Query.lessThan('startDate', thresholdDate),
					Query.limit(100),
					Query.select(['$id']),
				],
			})

			if (response.rows.length > 0) {
				await Promise.allSettled(response.rows.map(block => deleteTimeBlock(block.$id)))
				console.log(`[TimeBlocks Cleanup] TimeBlocks deleted: ${response.rows.length}`)
			}

			localStorage.setItem('last_timeblocks_cleanup', today)
		} catch (error) {
			console.error('[TimeBlocks Cleanup] Error:', error)
		}
	}, [])

	useEffect(() => {
		cleanupOldTimeBlocks()
	}, [cleanupOldTimeBlocks])

	useEffect(() => {
		getTimeBlocks()
	}, [getTimeBlocks])

	return {
		timeBlocks,
		isLoading,
		refreshTimeBlocks: getTimeBlocks,
	}
}
