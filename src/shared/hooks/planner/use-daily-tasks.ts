import { db } from '@/lib/appwrite'
import { createDailyTask, deleteDailyTask, updateDailyTask } from '@/lib/planner/planner'
import { DailyTask } from '@/shared/types/daily-task'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface UseDailyTasksProps {
	date: string
}

export const useDailyTasks = ({ date }: UseDailyTasksProps) => {
	const [tasks, setTasks] = useState<DailyTask[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [newTaskTitle, setNewTaskTitle] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	const getDailyTasks = useCallback(async () => {
		const userId = await getCurrentUserId()

		const queries = [Query.equal('userId', userId), Query.equal('date', date), Query.orderAsc('order')]

		try {
			setIsLoading(true)
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
				queries,
			})

			const typedDailyTasks = response.rows as unknown as DailyTask[]

			setTasks(typedDailyTasks)
			console.log(typedDailyTasks)
		} catch (error) {
			if (error instanceof Error) {
				console.error(error)
			}
		} finally {
			setIsLoading(false)
		}
	}, [date])

	useEffect(() => {
		getDailyTasks()
	}, [getDailyTasks])

	const handleAddTask = async () => {
		if (!newTaskTitle.trim()) {
			setIsCreating(false)
			return
		}

		const userId = await getCurrentUserId()

		const payload = {
			title: newTaskTitle,
			date: date,
			isCompleted: false,
			order: tasks.length,
			userId: userId,
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

	const handleDeleteTask = async (taskId: string) => {
		if (!window.confirm('Are you sure you want to delete this task?')) return

		const previousTasks = [...tasks]

		try {
			setTasks(prev => prev.filter(item => item.$id !== taskId))

			await deleteDailyTask(taskId)
		} catch (error) {
			console.error('Failed to delete task:', error)
			setTasks(previousTasks)
		}
	}

	const sortedTasks = useMemo(() => {
		if (!tasks) return []

		return [...tasks].sort((a, b) => {
			if (a.isCompleted !== b.isCompleted) {
				return a.isCompleted ? 1 : -1
			}

			return a.order - b.order
		})
	}, [tasks])

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
	}
}
