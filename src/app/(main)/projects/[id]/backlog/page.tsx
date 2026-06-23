'use client'

import { useProject } from '@/shared/context/project-context'
import { useBacklogState } from '@/shared/hooks/projects/kanban-board/use-backlog-state'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { CircleIcon } from '@/shared/ui/icons/projects/circle-icon'
import { InfoIcon } from '@/shared/ui/icons/projects/info-icon'
import { BeatLoader } from 'react-spinners'
import { BacklogRow } from './components/backlog-row/backlog-row'
import classes from './page.module.scss'

export default function BacklogPage() {
	const { project, isLoading: isProjectLoading } = useProject()

	const {
		backlogTasks,
		isKanbanLoading,
		updateTask,
		isAddingInline,
		setIsAddingInline,
		inlineTitle,
		setInlineTitle,
		taskToDelete,
		setTaskToDelete,
		isSubmitting,
		handleInlineSubmit,
		handleMoveToTodo,
		handleDeleteConfirm,
	} = useBacklogState(project!)

	const isLoading = isProjectLoading || isKanbanLoading

	if (isLoading) {
		return (
			<div className={classes.backlogPage}>
				<div className={classes.loaderWrapper}>
					<BeatLoader color='#aaa' size={10} />
				</div>
			</div>
		)
	}

	return (
		<div className={classes.backlogPage}>
			<div className={classes.inner}>
				<div className={classes.header}>
					<div className={classes.stats}>
						<span className={classes.badge}>{backlogTasks.length} tasks</span>
						<span className={classes.subtitle}>• not planned yet</span>
					</div>
					<button className={classes.addButton} onClick={() => setIsAddingInline(true)}>
						<PlusIcon className={classes.plusIcon} fill='currentColor' />
						<span>Add to backlog</span>
					</button>
				</div>
				<div className={classes.banner}>
					<InfoIcon className={classes.infoIcon} />
					<p>
						Tasks here are not visible on the Board. Hover a task and click{' '}
						<strong className={classes.actionText}>→ To Do</strong> to move it into the active workflow.
					</p>
				</div>
				<div className={classes.table}>
					<div className={classes.tableHeader}>
						<span className={classes.colTask}>TASK</span>
						<span className={classes.colTags}>LABELS</span>
						<span className={classes.colAdded}>ADDED</span>
						<span className={classes.colAction} />
					</div>
					<div className={classes.tableBody}>
						{backlogTasks.length === 0 && !isAddingInline ? (
							<div className={classes.emptyState}>No tasks in backlog yet</div>
						) : (
							<>
								{backlogTasks.map(task => (
									<BacklogRow
										key={task.$id}
										task={task}
										onUpdateTask={updateTask}
										onMoveToTodo={handleMoveToTodo}
										onDeleteRequest={setTaskToDelete}
									/>
								))}
								{isAddingInline && (
									<div className={classes.row}>
										<div className={classes.colTask}>
											<CircleIcon className={classes.circleIcon} />
											<input
												type='text'
												className={classes.inlineTaskInput}
												placeholder='What needs to be done?'
												value={inlineTitle}
												onChange={e => setInlineTitle(e.target.value)}
												onBlur={handleInlineSubmit}
												onKeyDown={e => {
													if (e.key === 'Enter') e.currentTarget.blur()

													if (e.key === 'Escape') {
														setInlineTitle('')
														setIsAddingInline(false)
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
							</>
						)}
					</div>
				</div>
			</div>
			<ConfirmModal
				isVisible={!!taskToDelete}
				onClose={() => setTaskToDelete(null)}
				onConfirm={handleDeleteConfirm}
				title='Delete Task from Backlog'
				message={
					<>
						Are you sure you want to permanently delete task &quot;
						<span className='highlight'>{taskToDelete?.title}</span>&quot;?
					</>
				}
			/>
		</div>
	)
}
