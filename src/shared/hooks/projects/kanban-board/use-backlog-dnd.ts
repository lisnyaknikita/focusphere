'use client'

import { KanbanTask } from '@/shared/types/kanban-task'
import {
	DragEndEvent,
	DragOverEvent,
	DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { useCallback, useState } from 'react'

interface UseBacklogDndProps {
	tasks: KanbanTask[]
	reorderBacklogTasks: (activeTaskId: string, targetSprintId: string | null, overTaskId?: string) => void
}

export const useBacklogDnd = ({ tasks, reorderBacklogTasks }: UseBacklogDndProps) => {
	const [activeDragTask, setActiveDragTask] = useState<KanbanTask | null>(null)
	const [activeOverId, setActiveOverId] = useState<string | null>(null)

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 6,
			},
		})
	)

	const getIsContainerHovered = useCallback(
		(containerSprintId: string | null) => {
			if (!activeDragTask || !activeOverId) return false

			if (activeOverId === `container-${containerSprintId || 'unassigned'}`) {
				return true
			}

			const overTask = tasks.find(t => t.$id === activeOverId)
			if (!overTask) return false

			if (containerSprintId === null) {
				return !overTask.sprintId
			}

			return overTask.sprintId === containerSprintId
		},
		[activeDragTask, activeOverId, tasks]
	)

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = tasks.find(t => t.$id === String(event.active.id)) || null
			setActiveDragTask(task)
			setActiveOverId(null)
		},
		[tasks]
	)

	const handleDragOver = useCallback((event: DragOverEvent) => {
		setActiveOverId(event.over ? String(event.over.id) : null)
	}, [])

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event
			setActiveDragTask(null)
			setActiveOverId(null)
			if (!over) return

			const activeTaskId = String(active.id)
			const overId = String(over.id)

			let targetSprintId: string | null = null
			let overTaskId: string | undefined = undefined

			if (overId.startsWith('container-')) {
				const containerKey = overId.replace('container-', '')
				targetSprintId = containerKey === 'unassigned' ? null : containerKey
			} else {
				overTaskId = overId
				const overTaskObj = tasks.find(t => t.$id === overId)
				if (overTaskObj) {
					targetSprintId = overTaskObj.sprintId || null
				}
			}

			reorderBacklogTasks(activeTaskId, targetSprintId, overTaskId)
		},
		[tasks, reorderBacklogTasks]
	)

	return {
		sensors,
		activeDragTask,
		getIsContainerHovered,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
	}
}
