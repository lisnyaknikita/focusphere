'use client'

import { useMemo } from 'react'
import 'temporal-polyfill/global'
import { useDailyTasks } from '../planner/use-daily-tasks'

export const useTasksByToday = () => {
	const today = useMemo(() => Temporal.Now.plainDateISO().toString(), [])

	const { tasks, isLoading, handleToggleTask } = useDailyTasks({ date: today })

	return {
		tasks,
		isLoading,
		handleToggleTask,
	}
}
