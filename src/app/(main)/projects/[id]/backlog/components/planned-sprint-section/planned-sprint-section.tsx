'use client'

import { useProjectPermissions } from '@/shared/hooks/projects/use-project-permissions'
import { CreateKanbanTaskPayload, KanbanTask } from '@/shared/types/kanban-task'
import { Sprint } from '@/shared/types/sprint'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { EditIcon } from '@/shared/ui/icons/edit-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { CircleIcon } from '@/shared/ui/icons/projects/circle-icon'
import { backlogFormatDateRange } from '@/shared/utils/backlog-format-date-range/backlog-format-date-range'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Dispatch, SetStateAction } from 'react'
import classes from '../../page.module.scss'
import { BacklogRow } from '../backlog-row/backlog-row'
import { DroppableContainer } from '../droppable-container/droppable-container'

interface PlannedSprintSectionProps {
	sprint: Sprint
	sprintTasks: KanbanTask[]
	isHighlighted: boolean
	addingToSprintId?: string | null | undefined
	inlineTitle: string
	isSubmitting: boolean
	setEditingSprint: Dispatch<SetStateAction<Sprint | null>>
	setSprintToStart: Dispatch<SetStateAction<Sprint | null>>
	setSprintToDelete: Dispatch<SetStateAction<Sprint | null>>
	setAddingToSprintId: Dispatch<SetStateAction<string | null | undefined>>
	setInlineTitle: Dispatch<SetStateAction<string>>
	setTaskToDelete: Dispatch<SetStateAction<KanbanTask | null>>
	updateTask: (taskId: string, data: Partial<CreateKanbanTaskPayload>) => Promise<void>
	handleInlineSubmit: (sprintId?: string | null) => Promise<void>
}

export const PlannedSprintSection = ({
	sprint,
	sprintTasks,
	isHighlighted,
	addingToSprintId,
	inlineTitle,
	isSubmitting,
	setEditingSprint,
	setSprintToDelete,
	setAddingToSprintId,
	setInlineTitle,
	setTaskToDelete,
	updateTask,
	setSprintToStart,
	handleInlineSubmit,
}: PlannedSprintSectionProps) => {
	const { canManageSprints } = useProjectPermissions()

	const sprintTaskIds = sprintTasks.map(t => t.$id)

	return (
		<DroppableContainer
			id={`container-${sprint.$id}`}
			isHighlighted={isHighlighted}
			className={`${classes.sprintSection} ${classes.sprintSectionPlanned}`}
		>
			<div className={classes.sprintHeader}>
				<div className={classes.sprintHeaderLeft}>
					<span className={`${classes.statusBadge} ${classes.planned}`}>Planned</span>
					<h3 className={classes.sprintTitle}>{sprint.name}</h3>
					{canManageSprints && (
						<button
							type='button'
							className={classes.editSprintBtn}
							onClick={() => setEditingSprint(sprint)}
							title='Edit sprint details'
						>
							<EditIcon width={18} height={18} />
						</button>
					)}
					<span className={classes.sprintMeta}>
						{backlogFormatDateRange(sprint.startDate, sprint.endDate)} • {sprintTasks.length} tasks
					</span>
				</div>

				{canManageSprints && (
					<div className={classes.sprintHeaderRight}>
						<button type='button' className={classes.startSprintBtn} onClick={() => setSprintToStart(sprint)}>
							Start Sprint
						</button>
						<button
							type='button'
							className={classes.deleteSprintBtn}
							onClick={() => setSprintToDelete(sprint)}
							title='Delete Sprint'
						>
							<DeleteIcon width={14} height={14} />
						</button>
					</div>
				)}
			</div>

			{sprint.goal && <div className={classes.sprintGoalBanner}>Goal: {sprint.goal}</div>}

			<div className={classes.table}>
				<div className={classes.tableHeader}>
					<span className={classes.colTask}>TASK</span>
					<span className={classes.colTags}>LABELS</span>
					<span className={classes.colAdded}>ADDED</span>
					<span className={classes.colAction} />
				</div>

				<SortableContext items={sprintTaskIds} strategy={verticalListSortingStrategy}>
					<div className={classes.tableBody}>
						{sprintTasks.length === 0 && addingToSprintId !== sprint.$id ? (
							<div className={classes.emptyState}>No tasks in planned sprint. Drag tasks here to assign.</div>
						) : (
							sprintTasks.map(task => (
								<BacklogRow key={task.$id} task={task} onUpdateTask={updateTask} onDeleteRequest={setTaskToDelete} />
							))
						)}

						{addingToSprintId === sprint.$id && (
							<div className={classes.row}>
								<div className={classes.colTask}>
									<CircleIcon className={classes.circleIcon} />
									<input
										type='text'
										className={classes.inlineTaskInput}
										placeholder='Task title...'
										value={inlineTitle}
										onChange={e => setInlineTitle(e.target.value)}
										onBlur={() => handleInlineSubmit(sprint.$id)}
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

				<button type='button' className={classes.createTaskInSprintBtn} onClick={() => setAddingToSprintId(sprint.$id)}>
					<PlusIcon className={classes.plusIcon} fill='currentColor' />
					<span>Create task in {sprint.name}</span>
				</button>
			</div>
		</DroppableContainer>
	)
}
