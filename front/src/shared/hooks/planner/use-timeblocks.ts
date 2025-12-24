import { db } from '@/lib/appwrite'
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

	useEffect(() => {
		getTimeBlocks()
	}, [getTimeBlocks])

	return {
		timeBlocks,
		isLoading,
		refreshTimeBlocks: getTimeBlocks,
	}
}
