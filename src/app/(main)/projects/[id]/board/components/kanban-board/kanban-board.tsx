'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useProject } from '@/shared/context/project-context'
import { useKanban } from '@/shared/hooks/projects/kanban-board/use-kanban'
import { useKanbanDnd } from '@/shared/hooks/projects/kanban-board/use-kanban-dnd'
import { useSprints } from '@/shared/hooks/projects/sprints/use-sprints'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { Column } from '@/shared/types/kanban'
import { Sprint } from '@/shared/types/sprint'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Link from 'next/link'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { EditSprintModal } from '../../../components/sprint-modals/edit-sprint-modal/edit-sprint-modal'
import { SprintBoardHeader } from '../sprint-board-header/sprint-board-header'
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
		isLoading: isTasksLoading,
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

	const { activeSprint, completeSprint, isLoading: isSprintsLoading } = useSprints(project?.$id)

	const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null)
	const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)

	const sprintFilteredTasks = activeSprint
		? tasks
				.filter(t => t.sprintId === activeSprint.$id)
				.map(t => (t.status === 'backlog' ? { ...t, status: 'todo' } : t))
		: tasks.filter(t => !t.sprintId && t.status !== 'backlog')

	const { activeTask, activeColumn, overColumnId, sensors, handleDragStart, handleDragOver, handleDragEnd } =
		useKanbanDnd({
			tasks: sprintFilteredTasks,
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

	const handleConfirmCompleteSprint = async (): Promise<void> => {
		if (!sprintToComplete) return
		const id = sprintToComplete.$id
		setSprintToComplete(null)
		try {
			await completeSprint(id)
		} catch (err: unknown) {
			console.error(err)
		}
	}

	if (isTasksLoading || isSprintsLoading) return <BeatLoader color='#aaa' size={10} className={classes.loader} />

	if (!activeSprint) {
		return (
			<div className={classes.emptySprintState}>
				<div className={classes.emptySprintContent}>
					<div className={classes.emptySprintIcon}>🚀</div>
					<h2 className={classes.emptySprintTitle}>No active sprint</h2>
					<p className={classes.emptySprintDescription}>
						Plan your work by creating a sprint in the backlog, adding tasks, and starting it when you&apos;re ready.
					</p>
					<Link href={`/projects/${project!.$id}/backlog`} className={classes.emptySprintLink}>
						Go to Backlog
					</Link>
				</div>
			</div>
		)
	}

	const columnIds = columns.map(col => col.id)

	return (
		<>
			<SprintBoardHeader
				projectId={project!.$id}
				activeSprint={activeSprint}
				tasks={tasks}
				onCompleteSprintClick={setSprintToComplete}
				onEditSprintClick={setEditingSprint}
			/>

			<div className={classes.kanbanWrapper} ref={sectionRef}>
				<DndContext
					sensors={sensors}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
					collisionDetection={closestCorners}
				>
					<SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
						{columns.map(column => (
							<KanbanColumn
								key={column.id}
								column={column}
								tasks={sprintFilteredTasks.filter(task => task.status === column.id)}
								listHeight={listHeight}
								autoFocusTitle={newColumnId === column.id}
								onUpdateTitle={handleUpdateTitleClick}
								onDeleteColumn={() => setColumnToDelete(column)}
								onAddTask={(title, status) => addTask(title, status, activeSprint?.$id)}
								onUpdateTask={updateTask}
								onDeleteTask={deleteTask}
								isOver={overColumnId === column.id}
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
								tasks={sprintFilteredTasks.filter(task => task.status === activeColumn.id)}
								listHeight={listHeight}
								isOverlay
								onAddTask={(title, status) => addTask(title, status, activeSprint?.$id)}
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
								Warning: This action is permanent! All tasks and subtasks inside this column will be completely
								destroyed.
							</strong>
						</>
					}
				/>

				<ConfirmModal
					isVisible={!!sprintToComplete}
					onClose={() => setSprintToComplete(null)}
					onConfirm={handleConfirmCompleteSprint}
					title='Complete Sprint'
					message={
						<>
							Are you sure you want to complete sprint &quot;
							<span className='highlight'>{sprintToComplete?.name}</span>&quot;?
							<br />
							<span style={{ fontSize: '13px', color: 'var(--textSecondary)', marginTop: '8px', display: 'block' }}>
								Completing this sprint will finish it and delete all associated tasks from the project.
							</span>
						</>
					}
				/>

				{editingSprint && (
					<Modal isVisible={!!editingSprint} onClose={() => setEditingSprint(null)}>
						<EditSprintModal projectId={project!.$id} sprint={editingSprint} onClose={() => setEditingSprint(null)} />
					</Modal>
				)}
			</div>
		</>
	)
}
