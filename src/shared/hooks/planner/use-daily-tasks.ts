'use client'

import { db } from '@/lib/appwrite'
import { createDailyTask, deleteDailyTask, updateDailyTask } from '@/lib/planner/planner'
import { DailyTask } from '@/shared/types/daily-task'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const CLEANUP_THRESHOLD_DAYS = 21
const BATCH_SIZE = 10
const REORDER_DEBOUNCE_DELAY = 1000

interface UseDailyTasksProps {
	date: string
}

export const useDailyTasks = ({ date }: UseDailyTasksProps) => {
	const [tasks, setTasks] = useState<DailyTask[]>([])
	const [userId, setUserId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [newTaskTitle, setNewTaskTitle] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		getCurrentUserId().then(setUserId)
	}, [])

	const getDailyTasks = useCallback(async () => {
		if (!userId) return

		const queries = [Query.equal('userId', userId), Query.equal('date', date), Query.orderAsc('order')]

		try {
			setIsLoading(true)
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
				queries,
			})

			setTasks(response.rows as unknown as DailyTask[])
		} catch (error) {
			console.error('Failed to fetch tasks:', error)
		} finally {
			setIsLoading(false)
		}
	}, [date, userId])

	useEffect(() => {
		getDailyTasks()
	}, [getDailyTasks])

	const handleAddTask = async () => {
		if (!newTaskTitle.trim() || !userId) {
			setIsCreating(false)
			return
		}

		const payload = {
			title: newTaskTitle,
			date,
			isCompleted: false,
			order: tasks.length,
			userId,
		}

		try {
			setIsSaving(true)
			const newTask = (await createDailyTask(payload)) as unknown as DailyTask
			setTasks(prev => [...prev, newTask])
			setNewTaskTitle('')
			setIsCreating(false)
		} catch (error) {
			console.error('Failed to create task:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleToggleTask = async (taskId: string, newStatus: boolean) => {
		const previousTasks = [...tasks]
		setTasks(prev => prev.map(item => (item.$id === taskId ? { ...item, isCompleted: newStatus } : item)))

		try {
			await updateDailyTask(taskId, { isCompleted: newStatus })
		} catch (error) {
			console.error('Failed to update task status:', error)
			setTasks(previousTasks)
		}
	}

	const handleEditTask = async (taskId: string, newTitle: string) => {
		const trimmed = newTitle.trim()
		if (!trimmed) return

		const previousTasks = [...tasks]
		setTasks(prev => prev.map(item => (item.$id === taskId ? { ...item, title: trimmed } : item)))

		try {
			await updateDailyTask(taskId, { title: trimmed })
		} catch (error) {
			console.error('Failed to edit task:', error)
			setTasks(previousTasks)
		}
	}

	const handleDeleteTask = async (taskId: string) => {
		const previousTasks = [...tasks]
		setTasks(prev => prev.filter(item => item.$id !== taskId))

		try {
			await deleteDailyTask(taskId)
		} catch (error) {
			console.error('Failed to delete task:', error)
			setTasks(previousTasks)
		}
	}

	const sortedTasks = useMemo(() => {
		return [...tasks].sort((a, b) => a.order - b.order)
	}, [tasks])

	const handleReorder = (newTasks: DailyTask[]) => {
		const tasksWithNewOrder = newTasks.map((task, index) => ({ ...task, order: index }))

		setTasks(tasksWithNewOrder)

		if (reorderTimeoutRef.current) {
			clearTimeout(reorderTimeoutRef.current)
		}

		reorderTimeoutRef.current = setTimeout(async () => {
			try {
				for (let i = 0; i < tasksWithNewOrder.length; i += BATCH_SIZE) {
					const batch = tasksWithNewOrder.slice(i, i + BATCH_SIZE)
					await Promise.all(batch.map(task => updateDailyTask(task.$id, { order: task.order })))
				}
			} catch (error) {
				console.error('Failed to save new order:', error)
				await getDailyTasks()
			}
		}, REORDER_DEBOUNCE_DELAY)
	}

	const cleanupOldTasks = useCallback(async () => {
		if (!userId) return

		const lastCleanup = localStorage.getItem('last_task_cleanup')
		const today = new Date().toISOString().split('T')[0]
		if (lastCleanup === today) return

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

				for (let i = 0; i < ids.length; i += BATCH_SIZE) {
					const batch = ids.slice(i, i + BATCH_SIZE)
					await Promise.allSettled(batch.map(id => deleteDailyTask(id)))
				}

				console.log(`[Auto-Cleanup] Removed ${response.rows.length} old tasks.`)
			}

			localStorage.setItem('last_task_cleanup', today)
		} catch (error) {
			console.error('[Auto-Cleanup] Error:', error)
		}
	}, [userId, getDailyTasks])

	useEffect(() => {
		cleanupOldTasks()
	}, [cleanupOldTasks])

	useEffect(() => {
		return () => {
			if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current)
		}
	}, [])

	useEffect(() => {
		const handleRefresh = () => getDailyTasks()
		window.addEventListener('refresh-daily-tasks', handleRefresh)
		return () => window.removeEventListener('refresh-daily-tasks', handleRefresh)
	}, [getDailyTasks])

	return {
		tasks: sortedTasks,
		isLoading,
		isCreating,
		setIsCreating,
		newTaskTitle,
		setNewTaskTitle,
		isSaving,
		handleAddTask,
		handleToggleTask,
		handleDeleteTask,
		handleEditTask,
		handleReorder,
	}
}
