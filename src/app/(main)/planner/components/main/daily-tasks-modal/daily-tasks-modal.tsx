import { useDailyTasks } from '@/shared/hooks/planner/use-daily-tasks'
import { DailyTask } from '@/shared/types/daily-task'
import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CloseButtonIcon } from '@/shared/ui/icons/calendar/close-button-icon'
import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import { formatModalDate } from '@/shared/utils/format-modal-date/format-modal-date'
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import clsx from 'clsx'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './daily-tasks-modal.module.scss'
import { SortableTaskItem } from './sortable-task-item/sortable-task-item'

interface DailyTasksModalProps {
	date: string
	onClose: () => void
	onTasksChanged: () => void
}

export const DailyTasksModal = ({ onClose, date, onTasksChanged }: DailyTasksModalProps) => {
	const [taskToDelete, setTaskToDelete] = useState<DailyTask | null>(null)
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')

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
		handleEditTask,
		handleReorder,
	} = useDailyTasks({ date })

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		})
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (over && active.id !== over.id) {
			const oldIndex = tasks.findIndex(t => t.$id === active.id)
			const newIndex = tasks.findIndex(t => t.$id === over.id)

			const newTasks = arrayMove(tasks, oldIndex, newIndex)
			handleReorder(newTasks)
			onTasksChanged()
		}
	}

	const confirmDelete = () => {
		if (taskToDelete) {
			handleDeleteTask(taskToDelete.$id)
			setTaskToDelete(null)
			onTasksChanged()
		}
	}

	const startEditing = (task: DailyTask) => {
		setEditingTaskId(task.$id)
		setEditingTitle(task.title)
	}

	const commitEdit = async () => {
		if (editingTaskId) {
			const previousTitle = tasks.find(task => task.$id === editingTaskId)?.title
			const nextTitle = editingTitle.trim()
			await handleEditTask(editingTaskId, editingTitle)
			if (nextTitle && previousTitle !== nextTitle) {
				onTasksChanged()
			}
		}
		setEditingTaskId(null)
		setEditingTitle('')
	}

	return (
		<>
			<div className={classes.modalInner}>
				<h4 className={classes.title}>{formatModalDate(date)}</h4>
				<div className={classes.scrollArea}>
					{isLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={tasks.map(task => task.$id)} strategy={verticalListSortingStrategy}>
								<ul className={classes.taskList}>
									{tasks.map(task => (
										<SortableTaskItem key={task.$id} task={task} editingTaskId={editingTaskId}>
											<div className={clsx(editingTaskId === task.$id && classes.newTaskItem)}>
												{editingTaskId === task.$id ? (
													<input
														autoFocus
														className={classes.inlineInput}
														value={editingTitle}
														onChange={e => setEditingTitle(e.target.value)}
														onBlur={commitEdit}
														onKeyDown={e => {
															if (e.key === 'Enter') commitEdit()
															if (e.key === 'Escape') {
																setEditingTaskId(null)
																setEditingTitle('')
															}
														}}
													/>
												) : (
													<CheckboxCard
														label={task.title}
														withBorder={true}
														checked={task.isCompleted}
														onCheck={async checked => {
															if (task.isCompleted === checked) return
															await handleToggleTask(task.$id, checked)
															onTasksChanged()
														}}
														onEdit={() => startEditing(task)}
														onDelete={() => setTaskToDelete(task)}
														withRemoval
														withEditing
													/>
												)}
											</div>
										</SortableTaskItem>
									))}
									{isCreating && (
										<li className={classes.newTaskItem}>
											<input
												autoFocus
												className={classes.inlineInput}
												placeholder='What needs to be done?'
												value={newTaskTitle}
												onChange={e => setNewTaskTitle(e.target.value)}
												onBlur={async () => {
													const hasTitle = !!newTaskTitle.trim()
													await handleAddTask()
													if (hasTitle) {
														onTasksChanged()
													}
												}}
												onKeyDown={async e => {
													if (e.key !== 'Enter') return
													const hasTitle = !!newTaskTitle.trim()
													await handleAddTask()
													if (hasTitle) {
														onTasksChanged()
													}
												}}
												disabled={isSaving}
											/>
										</li>
									)}
								</ul>
							</SortableContext>
						</DndContext>
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
