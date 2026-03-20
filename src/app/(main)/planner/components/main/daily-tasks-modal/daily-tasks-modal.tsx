import { useDailyTasks } from '@/shared/hooks/planner/use-daily-tasks'
import { DailyTask } from '@/shared/types/daily-task'
import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CloseButtonIcon } from '@/shared/ui/icons/calendar/close-button-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { formatModalDate } from '@/shared/utils/format-modal-date/format-modal-date'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './daily-tasks-modal.module.scss'

interface DailyTasksModalProps {
	date: string
	onClose: () => void
}

export const DailyTasksModal = ({ onClose, date }: DailyTasksModalProps) => {
	const [taskToDelete, setTaskToDelete] = useState<DailyTask | null>(null)

	const {
		tasks,
		isLoading,
		isCreating,
		setIsCreating,
		newTaskTitle,
		setNewTaskTitle,
		isSaving,
		handleAddTask,
		handleToggleTask,
		handleDeleteTask,
	} = useDailyTasks({ date })

	const confirmDelete = () => {
		if (taskToDelete) {
			handleDeleteTask(taskToDelete.$id)
			setTaskToDelete(null)
		}
	}

	return (
		<>
			<div className={classes.modalInner}>
				<h4 className={classes.title}>{formatModalDate(date)}</h4>
				<div className={classes.scrollArea}>
					{isLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<ul className={classes.taskList}>
							{tasks.map(task => (
								<li key={task.$id}>
									<CheckboxCard
										label={task.title}
										withBorder={true}
										checked={task.isCompleted}
										onCheck={checked => handleToggleTask(task.$id, checked)}
										onDelete={() => setTaskToDelete(task)}
										withRemoval
									/>
								</li>
							))}
							{isCreating && (
								<li className={classes.newTaskItem}>
									<input
										autoFocus
										className={classes.inlineInput}
										placeholder='What needs to be done?'
										value={newTaskTitle}
										onChange={e => setNewTaskTitle(e.target.value)}
										onBlur={handleAddTask}
										onKeyDown={e => e.key === 'Enter' && handleAddTask()}
										disabled={isSaving}
									/>
								</li>
							)}
						</ul>
					)}

					{!isLoading && tasks.length === 0 && !isCreating && <p className={classes.emptyMessage}>No tasks</p>}
				</div>
				<button className={classes.addTaskButton} onClick={() => setIsCreating(true)} disabled={isCreating || isSaving}>
					<PlusIcon />
					<span>Add new task</span>
				</button>
				<button className={classes.closeButton} onClick={() => onClose()}>
					<CloseButtonIcon />
				</button>
			</div>
			<ConfirmModal
				isVisible={!!taskToDelete}
				onClose={() => setTaskToDelete(null)}
				onConfirm={confirmDelete}
				title='Delete Daily Task'
				message={
					<>
						Are you sure you want to delete &quot;<span className='highlight'>{taskToDelete?.title}</span>&quot;?
					</>
				}
			/>
		</>
	)
}
