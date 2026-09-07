'use client'

import { db } from '@/lib/appwrite'
import { deleteDailyTask } from '@/lib/planner/planner'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useQueryClient } from '@tanstack/react-query'
import { Query } from 'appwrite'
import { useEffect } from 'react'

const CLEANUP_THRESHOLD_DAYS = 21
const BATCH_SIZE = 10

let isCleanupRunning = false

export const useDailyTasksCleanup = () => {
	const queryClient = useQueryClient()
	const { user } = useUser()
	const userId = user?.$id

	useEffect(() => {
		if (!userId || isCleanupRunning) return

		const today = new Date().toISOString().split('T')[0]
		const lastCleanup = localStorage.getItem('last_task_cleanup')

		if (lastCleanup === today) return

		const performCleanup = async () => {
			isCleanupRunning = true

			try {
				const thresholdDate = new Date()
				thresholdDate.setDate(thresholdDate.getDate() - CLEANUP_THRESHOLD_DAYS)
				const thresholdDateStr = thresholdDate.toISOString().split('T')[0]

				const response = await db.listRows({
					databaseId: process.env.NEXT_PUBLIC_DB_ID!,
					tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
					queries: [
						Query.equal('userId', userId),
						Query.lessThan('date', thresholdDateStr),
						Query.limit(100),
						Query.select(['$id']),
					],
				})

				if (response.rows.length > 0) {
					const ids = response.rows.map(task => task.$id)
					let hasErrors = false

					for (let i = 0; i < ids.length; i += BATCH_SIZE) {
						const batch = ids.slice(i, i + BATCH_SIZE)
						const results = await Promise.allSettled(batch.map(id => deleteDailyTask(id)))

						if (results.some(res => res.status === 'rejected')) {
							hasErrors = true
						}
					}

					console.log(`[Auto-Cleanup] Processed ${response.rows.length} old tasks.`)

					queryClient.invalidateQueries({ queryKey: ['daily-tasks'] })
					queryClient.invalidateQueries({ queryKey: ['daily-tasks-counters'] })

					if (!hasErrors) {
						localStorage.setItem('last_task_cleanup', today)
					}
				} else {
					localStorage.setItem('last_task_cleanup', today)
				}
			} catch (error) {
				console.error('[Auto-Cleanup] Failed:', error)
			} finally {
				isCleanupRunning = false
			}
		}

		const timeoutId = setTimeout(performCleanup, 3000)

		return () => clearTimeout(timeoutId)
	}, [userId, queryClient])
}
