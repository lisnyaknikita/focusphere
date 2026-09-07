'use client'

import { db } from '@/lib/appwrite'
import { createDailyTask, deleteDailyTask, updateDailyTask } from '@/lib/planner/planner'
import { DailyTask } from '@/shared/types/daily-task'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Query } from 'appwrite'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useUser } from '../use-user/use-user'

const BATCH_SIZE = 10
const REORDER_DEBOUNCE_DELAY = 1000

interface UseDailyTasksProps {
	date: string
}

export const useDailyTasks = ({ date }: UseDailyTasksProps) => {
	const queryClient = useQueryClient()
	const { user, loading: isUserLoading } = useUser()
	const userId = user?.$id

	const queryKey = useMemo(() => ['daily-tasks', date, userId], [date, userId])
	const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const {
		data: tasks = [],
		isLoading: isQueryLoading,
		refetch: getDailyTasks,
	} = useQuery<DailyTask[]>({
		queryKey,
		queryFn: async () => {
			const queries = [Query.equal('userId', userId!), Query.equal('date', date), Query.orderAsc('order')]

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
				queries,
			})

			return response.rows as unknown as DailyTask[]
		},
		enabled: !!userId,
	})

	const toggleTaskMutation = useMutation({
		mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: boolean }) =>
			updateDailyTask(taskId, { isCompleted: newStatus }),
		onMutate: async ({ taskId, newStatus }) => {
			await queryClient.cancelQueries({ queryKey })
			const previousTasks = queryClient.getQueryData<DailyTask[]>(queryKey) ?? []

			queryClient.setQueryData<DailyTask[]>(queryKey, (old = []) =>
				old.map(item => (item.$id === taskId ? { ...item, isCompleted: newStatus } : item))
			)

			return { previousTasks }
		},
		onError: (_, __, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(queryKey, context.previousTasks)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['daily-tasks-counters'] })
		},
	})

	const deleteTaskMutation = useMutation({
		mutationFn: (taskId: string) => deleteDailyTask(taskId),
		onMutate: async taskId => {
			await queryClient.cancelQueries({ queryKey })
			const previousTasks = queryClient.getQueryData<DailyTask[]>(queryKey) ?? []

			queryClient.setQueryData<DailyTask[]>(queryKey, (old = []) => old.filter(item => item.$id !== taskId))

			return { previousTasks }
		},
		onError: (_, __, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(queryKey, context.previousTasks)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['daily-tasks-counters'] })
		},
	})

	const addTaskMutation = useMutation({
		mutationFn: (title: string) =>
			createDailyTask({
				title,
				date,
				isCompleted: false,
				order: tasks.length,
				userId: userId!,
			}),
		onSuccess: newTask => {
			queryClient.setQueryData<DailyTask[]>(queryKey, (old = []) => [...old, newTask as unknown as DailyTask])
			queryClient.invalidateQueries({ queryKey: ['daily-tasks-counters'] })
		},
	})

	const editTaskMutation = useMutation({
		mutationFn: ({ taskId, title }: { taskId: string; title: string }) => updateDailyTask(taskId, { title }),
		onMutate: async ({ taskId, title }) => {
			await queryClient.cancelQueries({ queryKey })
			const previousTasks = queryClient.getQueryData<DailyTask[]>(queryKey) ?? []

			queryClient.setQueryData<DailyTask[]>(queryKey, (old = []) =>
				old.map(item => (item.$id === taskId ? { ...item, title } : item))
			)

			return { previousTasks }
		},
		onError: (_, __, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(queryKey, context.previousTasks)
			}
		},
	})

	const sortedTasks = useMemo(() => {
		return [...tasks].sort((a, b) => a.order - b.order)
	}, [tasks])

	const handleToggleTask = useCallback(
		(taskId: string, newStatus: boolean) => {
			toggleTaskMutation.mutate({ taskId, newStatus })
		},
		[toggleTaskMutation]
	)

	const handleDeleteTask = useCallback(
		(taskId: string) => {
			deleteTaskMutation.mutate(taskId)
		},
		[deleteTaskMutation]
	)

	const handleEditTask = useCallback(
		(taskId: string, newTitle: string) => {
			const trimmed = newTitle.trim()
			if (!trimmed) return
			editTaskMutation.mutate({ taskId, title: trimmed })
		},
		[editTaskMutation]
	)

	const handleAddTask = useCallback(
		async (title: string) => {
			if (!title.trim() || !userId) return
			await addTaskMutation.mutateAsync(title)
		},
		[addTaskMutation, userId]
	)

	const handleReorder = useCallback(
		(newTasks: DailyTask[]) => {
			const tasksWithNewOrder = newTasks.map((task, index) => ({ ...task, order: index }))
			queryClient.setQueryData(queryKey, tasksWithNewOrder)

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
					queryClient.invalidateQueries({ queryKey })
				}
			}, REORDER_DEBOUNCE_DELAY)
		},
		[queryClient, queryKey]
	)

	useEffect(() => {
		return () => {
			if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current)
		}
	}, [])

	const isLoading = isUserLoading || isQueryLoading || !userId

	return {
		tasks: sortedTasks,
		isLoading,
		isSaving: addTaskMutation.isPending,
		handleAddTask,
		handleToggleTask,
		handleDeleteTask,
		handleEditTask,
		handleReorder,
		refetch: getDailyTasks,
	}
}
