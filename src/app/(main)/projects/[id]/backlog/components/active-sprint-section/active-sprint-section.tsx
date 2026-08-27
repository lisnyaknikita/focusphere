'use client'

import { useProjectPermissions } from '@/shared/hooks/projects/use-project-permissions'
import { CreateKanbanTaskPayload, KanbanTask } from '@/shared/types/kanban-task'
import { Sprint } from '@/shared/types/sprint'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { CircleIcon } from '@/shared/ui/icons/projects/circle-icon'
import { backlogFormatDateRange } from '@/shared/utils/backlog-format-date-range/backlog-format-date-range'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Dispatch, SetStateAction } from 'react'
import classes from '../../page.module.scss'
import { BacklogRow } from '../backlog-row/backlog-row'
import { DroppableContainer } from '../droppable-container/droppable-container'

interface ActiveSprintSectionProps {
	activeSprint: Sprint
	activeTasks: KanbanTask[]
	isHighlighted: boolean
	addingToSprintId?: string | null | undefined
	inlineTitle: string
	isSubmitting: boolean
	setEditingSprint: Dispatch<SetStateAction<Sprint | null>>
	setSprintToComplete: Dispatch<SetStateAction<Sprint | null>>
	setAddingToSprintId: Dispatch<SetStateAction<string | null | undefined>>
	setInlineTitle: Dispatch<SetStateAction<string>>
	setTaskToDelete: Dispatch<SetStateAction<KanbanTask | null>>
	updateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	handleInlineSubmit: (sprintId?: string | null) => Promise<void>
}

export const ActiveSprintSection = ({
	activeSprint,
	activeTasks,
	isHighlighted,
	addingToSprintId,
	inlineTitle,
	isSubmitting,
	setEditingSprint,
	setSprintToComplete,
	setAddingToSprintId,
	setInlineTitle,
	setTaskToDelete,
	updateTask,
	handleInlineSubmit,
}: ActiveSprintSectionProps) => {
	const { canManageSprints } = useProjectPermissions()

	const completedCount = activeTasks.filter(t => t.status === 'done').length
	const progressPct = activeTasks.length > 0 ? Math.round((completedCount / activeTasks.length) * 100) : 0
	const activeTaskIds = activeTasks.map(t => t.$id)

	return (
		<DroppableContainer
			id={`container-${activeSprint.$id}`}
			isHighlighted={isHighlighted}
			className={`${classes.sprintSection} ${classes.sprintSectionActive}`}
		>
			<div className={classes.sprintHeader}>
				<div className={classes.sprintHeaderLeft}>
					<span className={`${classes.statusBadge} ${classes.active}`}>Active</span>
					<h3 className={classes.sprintTitle}>{activeSprint.name}</h3>
					{canManageSprints && (
						<button
							type='button'
							className={classes.editSprintBtn}
							onClick={() => setEditingSprint(activeSprint)}
							title='Edit sprint details'
						>
							<EditIcon width={18} height={18} />
						</button>
					)}
					<span className={classes.sprintMeta}>
						{backlogFormatDateRange(activeSprint.startDate, activeSprint.endDate)}
					</span>
				</div>

				<div className={classes.sprintHeaderRight}>
					<div className={classes.sprintProgress}>
						<div className={classes.progressBarTrack}>
							<div className={classes.progressBarFill} style={{ width: `${progressPct}%` }} />
						</div>
						<span>
							{completedCount}/{activeTasks.length} Done ({progressPct}%)
						</span>
					</div>
					{canManageSprints && (
						<button
							type='button'
							className={classes.completeSprintBtn}
							onClick={() => setSprintToComplete(activeSprint)}
						>
							Complete Sprint
						</button>
					)}
				</div>
			</div>

			{activeSprint.goal && <div className={classes.sprintGoalBanner}>Goal: {activeSprint.goal}</div>}

			<div className={classes.table}>
				<div className={classes.tableHeader}>
					<span className={classes.colTask}>TASK</span>
					<span className={classes.colTags}>LABELS</span>
					<span className={classes.colAdded}>ADDED</span>
					<span className={classes.colAction} />
				</div>

				<SortableContext items={activeTaskIds} strategy={verticalListSortingStrategy}>
					<div className={classes.tableBody}>
						{activeTasks.length === 0 && addingToSprintId !== activeSprint.$id ? (
							<p className={classes.emptyState}>No tasks in active sprint yet. Drag tasks here to assign.</p>
						) : (
							activeTasks.map(task => (
								<BacklogRow key={task.$id} task={task} onUpdateTask={updateTask} onDeleteRequest={setTaskToDelete} />
							))
						)}

						{addingToSprintId === activeSprint.$id && (
							<div className={classes.row}>
								<div className={classes.colTask}>
									<CircleIcon className={classes.circleIcon} />
									<input
										type='text'
										className={classes.inlineTaskInput}
										placeholder='Task title...'
										value={inlineTitle}
										onChange={e => setInlineTitle(e.target.value)}
										onBlur={() => handleInlineSubmit(activeSprint.$id)}
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

				<button
					type='button'
					className={classes.createTaskInSprintBtn}
					onClick={() => setAddingToSprintId(activeSprint.$id)}
				>
					<PlusIcon className={classes.plusIcon} fill='currentColor' />
					<span>Create task in {activeSprint.name}</span>
				</button>
			</div>
		</DroppableContainer>
	)
}
