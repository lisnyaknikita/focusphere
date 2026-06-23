import { Column } from '@/shared/types/kanban'
import { KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import { toast } from 'sonner'

interface UseKanbanDndProps {
	tasks: KanbanTask[]
	columns: Column[]
	setColumns: React.Dispatch<React.SetStateAction<Column[]>>
	moveTask: (taskId: string, newStatus: TaskStatus, overTaskId?: string) => Promise<void>
	reorderTasks: (newTasks: KanbanTask[], status: TaskStatus) => Promise<void>
	updateColumnsMutate: (newColumns: Column[]) => Promise<unknown>
	triggerProjectUpdate: () => void
}

export const useKanbanDnd = ({
	tasks,
	columns,
	setColumns,
	moveTask,
	reorderTasks,
	updateColumnsMutate,
	triggerProjectUpdate,
}: UseKanbanDndProps) => {
	const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)
	const [activeColumn, setActiveColumn] = useState<Column | null>(null)

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

	const handleDragStart = (event: DragStartEvent): void => {
		const { active } = event
		const activeType = active.data.current?.type as string | undefined

		if (activeType === 'Task') {
			setActiveTask(tasks.find(t => t.$id === active.id) ?? null)
		}
		if (activeType === 'Column') {
			setActiveColumn(columns.find(c => c.id === active.id) ?? null)
		}
	}

	const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
		setActiveTask(null)
		setActiveColumn(null)

		const { active, over } = event
		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string

		if (activeId === overId) return

		const activeType = active.data.current?.type as string | undefined

		if (activeType === 'Column') {
			const oldIndex = columns.findIndex(col => col.id === activeId)
			const newIndex = columns.findIndex(col => col.id === overId)
			const sortedColumns = arrayMove(columns, oldIndex, newIndex)
			setColumns(sortedColumns)

			try {
				await updateColumnsMutate(sortedColumns)
				triggerProjectUpdate()
			} catch (err: unknown) {
				console.error(err)
				toast.error('Failed to save columns order')
			}
			return
		}

		if (activeType === 'Task') {
			const activeTaskItem = tasks.find(t => t.$id === activeId)
			const overTaskItem = tasks.find(t => t.$id === overId)
			if (!activeTaskItem) return

			if (overTaskItem) {
				if (activeTaskItem.status !== overTaskItem.status) {
					await moveTask(activeId, overTaskItem.status as TaskStatus, overId)
				} else {
					const oldIndex = tasks.findIndex(t => t.$id === activeId)
					const newIndex = tasks.findIndex(t => t.$id === overId)
					const reordered = arrayMove(tasks, oldIndex, newIndex)
					await reorderTasks(reordered, activeTaskItem.status as TaskStatus)
				}
			} else {
				const isOverColumn = columns.some(c => c.id === overId)
				if (isOverColumn && activeTaskItem.status !== overId) {
					await moveTask(activeId, overId as TaskStatus)
				}
			}
		}
	}

	return {
		activeTask,
		activeColumn,
		sensors,
		handleDragStart,
		handleDragEnd,
	}
}
