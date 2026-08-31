'use client'

import { CreateKanbanTaskPayload, KanbanTask } from '@/shared/types/kanban-task'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { CircleIcon } from '@/shared/ui/icons/projects/circle-icon'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Dispatch, SetStateAction } from 'react'
import classes from '../../page.module.scss'
import { BacklogRow } from '../backlog-row/backlog-row'
import { DroppableContainer } from '../droppable-container/droppable-container'

interface UnassignedBacklogSectionProps {
	unassignedTasks: KanbanTask[]
	isHighlighted: boolean
	addingToSprintId?: string | null | undefined
	inlineTitle: string
	isSubmitting: boolean
	setAddingToSprintId: Dispatch<SetStateAction<string | null | undefined>>
	setInlineTitle: Dispatch<SetStateAction<string>>
	setTaskToDelete: Dispatch<SetStateAction<KanbanTask | null>>
	updateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	deleteTask?: (taskId: string) => Promise<void>
	handleInlineSubmit: (sprintId?: string | null) => Promise<void>
}

export const UnassignedBacklogSection = ({
	unassignedTasks,
	isHighlighted,
	addingToSprintId,
	inlineTitle,
	isSubmitting,
	setAddingToSprintId,
	setInlineTitle,
	setTaskToDelete,
	updateTask,
	deleteTask,
	handleInlineSubmit,
}: UnassignedBacklogSectionProps) => {
	const unassignedTaskIds = unassignedTasks.map(t => t.$id)

	return (
		<DroppableContainer id='container-unassigned' isHighlighted={isHighlighted} className={classes.sprintSection}>
			<div className={classes.sprintHeader}>
				<div className={classes.sprintHeaderLeft}>
					<span className={`${classes.statusBadge} ${classes.backlog}`}>Backlog</span>
					<h3 className={classes.sprintTitle}>Unassigned Tasks</h3>
					<span className={classes.sprintMeta}>({unassignedTasks.length} tasks)</span>
				</div>
				<div className={classes.sprintHeaderRight}>
					<button type='button' className={classes.addButton} onClick={() => setAddingToSprintId(null)}>
						<PlusIcon className={classes.plusIcon} fill='currentColor' />
						<span>Add task</span>
					</button>
				</div>
			</div>

			<div className={classes.table}>
				<div className={classes.tableHeader}>
					<span className={classes.colTask}>TASK</span>
					<span className={classes.colTags}>LABELS</span>
					<span className={classes.colAdded}>ADDED</span>
					<span className={classes.colAction} />
				</div>

				<SortableContext items={unassignedTaskIds} strategy={verticalListSortingStrategy}>
					<div className={classes.tableBody}>
						{unassignedTasks.length === 0 && addingToSprintId !== null ? (
							<div className={classes.emptyState}>No unassigned tasks in backlog</div>
						) : (
							unassignedTasks.map(task => (
								<BacklogRow
									key={task.$id}
									task={task}
									onUpdateTask={updateTask}
									onDeleteRequest={setTaskToDelete}
									onDeleteTask={deleteTask}
								/>
							))
						)}

						{addingToSprintId === null && (
							<div className={classes.row}>
								<div className={classes.colTask}>
									<CircleIcon className={classes.circleIcon} />
									<input
										type='text'
										className={classes.inlineTaskInput}
										placeholder='What needs to be done?'
										value={inlineTitle}
										onChange={e => setInlineTitle(e.target.value)}
										onBlur={() => handleInlineSubmit(null)}
										onKeyDown={e => {
											if (e.key === 'Enter') e.currentTarget.blur()
											if (e.key === 'Escape') {
												setInlineTitle('')
												setAddingToSprintId(undefined)
											}
										}}
										autoFocus
										disabled={isSubmitting}
									/>
								</div>
								<div className={classes.colTags}>
									<span className={classes.emptyValue}>—</span>
								</div>
								<div className={classes.colAdded}>
									<span className={classes.dateText}>Today</span>
								</div>
								<div className={classes.colAction} />
							</div>
						)}
					</div>
				</SortableContext>

				<button type='button' className={classes.createTaskInSprintBtn} onClick={() => setAddingToSprintId(null)}>
					<PlusIcon className={classes.plusIcon} fill='currentColor' />
					<span>Create task in Backlog</span>
				</button>
			</div>
		</DroppableContainer>
	)
}
