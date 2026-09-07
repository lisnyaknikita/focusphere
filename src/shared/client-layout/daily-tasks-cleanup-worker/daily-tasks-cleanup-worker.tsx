'use client'

import { useDailyTasksCleanup } from '@/shared/hooks/planner/use-daily-task-cleanup'

export const DailyTasksCleanupWorker = () => {
	useDailyTasksCleanup()
	return null
}
