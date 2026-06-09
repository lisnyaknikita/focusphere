'use client'

import { deleteKanbanTask } from '@/lib/projects/kanban-board-tasks/tasks'
import { updateProject } from '@/lib/projects/projects'
import { useBilling } from '@/shared/context/billing-context'
import { useProject } from '@/shared/context/project-context'
import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { Column } from '@/shared/types/kanban'
import { KanbanTask, TaskStatus } from '@/shared/types/kanban-task'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import {
	closestCorners,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'sonner'
import classes from './kanban-board.module.scss'
import { KanbanColumn } from './kanban-column/kanban-column'
import { KanbanTaskCard } from './kanban-column/kanban-task-card/kanban-task-card'

const DEFAULT_COLUMNS: Column[] = [
	{ id: 'todo', title: 'To Do' },
	{ id: 'inprogress', title: 'In Progress' },
	{ id: 'done', title: 'Done' },
]

export const KanbanBoard = () => {
	const { project } = useProject()
	const { tasks, isLoading, addTask, moveTask, updateTask, deleteTask, reorderTasks } = useKanban(project!)
	const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)
	const [activeColumn, setActiveColumn] = useState<Column | null>(null)
	const [columns, setColumns] = useState<Column[]>([])
	const { sectionRef, listHeight } = useSectionHeight(0.894)
	const [newColumnId, setNewColumnId] = useState<string | null>(null)
	const [columnToDelete, setColumnToDelete] = useState<Column | null>(null)

	const { isPro, openPaywall } = useBilling()

	useEffect(() => {
		if (project?.columns && project.columns.length > 0) {
			setColumns(project.columns.map(col => JSON.parse(col)))
		} else {
			setColumns(DEFAULT_COLUMNS)
		}
	}, [project?.columns])

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		})
	)

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		const activeType = active.data.current?.type

		if (activeType === 'Task') {
			const currentTask = tasks.find(t => t.$id === active.id)
			setActiveTask(currentTask ?? null)
		}

		if (activeType === 'Column') {
			const currentCol = columns.find(c => c.id === active.id)
			setActiveColumn(currentCol ?? null)
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveTask(null)
		setActiveColumn(null)

		const { active, over } = event
		if (!over || !project) return

		const activeId = active.id as string
		const overId = over.id as string

		if (activeId === overId) return

		const activeType = active.data.current?.type
		const overType = over.data.current?.type

		if (activeType === 'Column') {
			setColumns(prev => {
				const oldIndex = prev.findIndex(col => col.id === activeId)
				const newIndex = prev.findIndex(col => col.id === overId)
				const newColumns = arrayMove(prev, oldIndex, newIndex)

				updateProject(project.$id, { columns: newColumns.map(c => JSON.stringify(c)) })

				return newColumns
			})
			return
		}

		if (activeType === 'Task') {
			const activeTask = tasks.find(t => t.$id === activeId)
			const overTask = tasks.find(t => t.$id === overId)

			if (overTask) {
				if (activeTask?.status !== overTask.status) {
					moveTask(activeId, overTask.status as TaskStatus)
				} else {
					const oldIndex = tasks.findIndex(t => t.$id === activeId)
					const newIndex = tasks.findIndex(t => t.$id === overId)
					reorderTasks(arrayMove(tasks, oldIndex, newIndex))
				}
			} else {
				if (overType === 'Column' && activeTask?.status !== overId) {
					moveTask(activeId, overId as TaskStatus)
				}
			}
		}
	}

	const handleAddColumn = async () => {
		if (!project) return

		if (!isPro) {
			openPaywall('kanban_customization')
			return
		}

		const id = `col_${Date.now()}`
		const newCol: Column = { id, title: 'New Column' }
		const updatedColumns = [...columns, newCol]

		setColumns(updatedColumns)
		setNewColumnId(id)

		await updateProject(project.$id, { columns: updatedColumns.map(c => JSON.stringify(c)) })
	}

	const handleUpdateColumnTitle = async (columnId: string, newTitle: string) => {
		if (!project) return

		const updatedColumns = columns.map(col => (col.id === columnId ? { ...col, title: newTitle } : col))

		setColumns(updatedColumns)
		if (newColumnId === columnId) setNewColumnId(null)

		await updateProject(project.$id, { columns: updatedColumns.map(c => JSON.stringify(c)) })
	}

	const handleConfirmDeleteColumn = async () => {
		if (!columnToDelete || !project) return

		const targetColumnId = columnToDelete.id
		const updatedColumns = columns.filter(col => col.id !== targetColumnId)

		setColumns(updatedColumns)
		setColumnToDelete(null)

		try {
			await updateProject(project.$id, {
				columns: updatedColumns.map(c => JSON.stringify(c)),
			})

			const tasksToDelete = tasks.filter(task => task.status === targetColumnId)

			if (tasksToDelete.length > 0) {
				const batchDeletes = tasksToDelete.map(task => deleteKanbanTask(task.$id))
				const cascadeExecution = Promise.all(batchDeletes)

				toast.promise(cascadeExecution, {
					loading: `Deleting column and destroying ${tasksToDelete.length} tasks...`,
					success: 'Column and all associated tasks permanently deleted',
					error: 'Column deleted, but some tasks failed to delete',
				})

				await cascadeExecution
			} else {
				toast.success('Empty column deleted successfully')
			}
		} catch (error) {
			console.error('Failed to execute cascade delete for column:', error)
			toast.error('Failed to delete column')
		}
	}

	if (isLoading) return <BeatLoader color='#aaa' size={10} className={classes.loader} />

	const columnIds = columns.map(col => col.id)

	return (
		<div className={classes.kanbanWrapper} ref={sectionRef}>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				collisionDetection={closestCorners}
			>
				<SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
					{columns.map(column => (
						<KanbanColumn
							key={column.id}
							column={column}
							tasks={tasks.filter(task => task.status === column.id)}
							listHeight={listHeight}
							autoFocusTitle={newColumnId === column.id}
							onUpdateTitle={handleUpdateColumnTitle}
							onDeleteColumn={() => setColumnToDelete(column)}
							onAddTask={addTask}
							onUpdateTask={updateTask}
							onDeleteTask={deleteTask}
						/>
					))}
					<button type='button' className={classes.addColumnBtn} onClick={handleAddColumn}>
						<PlusIcon />
					</button>
				</SortableContext>
				<DragOverlay adjustScale={false}>
					{activeTask && (
						<KanbanTaskCard task={activeTask} isOverlay onUpdateTask={updateTask} onDeleteTask={deleteTask} />
					)}
					{activeColumn && (
						<KanbanColumn
							column={activeColumn}
							tasks={tasks.filter(task => task.status === activeColumn.id)}
							listHeight={listHeight}
							isOverlay
							onAddTask={addTask}
							onUpdateTask={updateTask}
							onDeleteTask={deleteTask}
						/>
					)}
				</DragOverlay>
			</DndContext>
			<ConfirmModal
				isVisible={!!columnToDelete}
				onClose={() => setColumnToDelete(null)}
				onConfirm={handleConfirmDeleteColumn}
				title='Delete Column Permanently'
				message={
					<>
						Are you sure you want to delete column &quot;
						<span className='highlight'>{columnToDelete?.title}</span>
						&quot;?{' '}
						<strong style={{ color: '#DC2626', display: 'block', marginTop: '8px' }}>
							Warning: This action is permanent! All tasks and subtasks inside this column will be completely destroyed.
						</strong>
					</>
				}
			/>
		</div>
	)
}
