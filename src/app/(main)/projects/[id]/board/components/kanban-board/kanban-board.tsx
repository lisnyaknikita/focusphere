'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useProject } from '@/shared/context/project-context'
import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useKanbanDnd } from '@/shared/hooks/projects/kanban-board/use-kanban-dnd'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { Column } from '@/shared/types/kanban'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './kanban-board.module.scss'
import { KanbanColumn } from './kanban-column/kanban-column'
import { KanbanTaskCard } from './kanban-column/kanban-task-card/kanban-task-card'

export const KanbanBoard = () => {
	const { project } = useProject()
	const { isPro, openPaywall } = useBilling()
	const { sectionRef, listHeight } = useSectionHeight(0.894)

	const {
		tasks,
		columns,
		setColumns,
		isLoading,
		addColumn,
		updateColumnTitle,
		deleteColumnCascade,
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		reorderTasks,
		updateColumnsMutate,
		triggerProjectUpdate,
	} = useKanban(project!)

	const { activeTask, activeColumn, sensors, handleDragStart, handleDragEnd } = useKanbanDnd({
		tasks,
		columns,
		setColumns,
		moveTask,
		reorderTasks,
		updateColumnsMutate,
		triggerProjectUpdate,
	})

	const [newColumnId, setNewColumnId] = useState<string | null>(null)
	const [columnToDelete, setColumnToDelete] = useState<Column | null>(null)

	const handleAddColumnClick = async (): Promise<void> => {
		if (!isPro) {
			openPaywall('kanban_customization')
			return
		}
		const id = `col_${Date.now()}`
		setNewColumnId(id)
		try {
			await addColumn(id, 'New Column')
		} catch (err: unknown) {
			console.error(err)
		}
	}

	const handleUpdateTitleClick = async (columnId: string, newTitle: string): Promise<void> => {
		if (newColumnId === columnId) setNewColumnId(null)
		try {
			await updateColumnTitle(columnId, newTitle)
		} catch (err: unknown) {
			console.error(err)
		}
	}

	const handleConfirmDeleteColumn = async (): Promise<void> => {
		if (!columnToDelete) return
		const targetId = columnToDelete.id
		setColumnToDelete(null)
		try {
			await deleteColumnCascade(targetId)
		} catch (err: unknown) {
			console.error(err)
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
							onUpdateTitle={handleUpdateTitleClick}
							onDeleteColumn={() => setColumnToDelete(column)}
							onAddTask={addTask}
							onUpdateTask={updateTask}
							onDeleteTask={deleteTask}
						/>
					))}
					<button type='button' className={classes.addColumnBtn} onClick={handleAddColumnClick}>
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
