import { db } from '@/lib/appwrite'
import { createDailyTask, deleteDailyTask, updateDailyTask } from '@/lib/planner/planner'
import { DailyTask } from '@/shared/types/daily-task'
import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './daily-tasks-modal.module.scss'

interface DailyTasksModalProps {
	date: string
	onClose: () => void
}

export const DailyTasksModal = ({ onClose, date }: DailyTasksModalProps) => {
	const [tasks, setTasks] = useState<DailyTask[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [newTaskTitle, setNewTaskTitle] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	const getDailyTasks = async () => {
		const userId = await getCurrentUserId()

		const queries = [Query.equal('userId', userId), Query.equal('date', date), Query.orderAsc('order')]

		try {
			setIsLoading(true)
			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_DAILY_TASKS!,
				queries,
			})

			const typedDailyTasks = response.rows as unknown as DailyTask[]

			setTasks(typedDailyTasks)
			console.log(typedDailyTasks)
		} catch (error) {
			if (error instanceof Error) {
				console.error(error)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const formatModalDate = (dateString: string) => {
		const date = new Date(dateString)

		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		}).format(date)
	}

	const handleAddTask = async () => {
		if (!newTaskTitle.trim()) {
			setIsCreating(false)
			return
		}

		const userId = await getCurrentUserId()

		const payload = {
			title: newTaskTitle,
			date: date,
			isCompleted: false,
			order: tasks.length,
			userId: userId,
		}

		try {
			setIsSaving(true)
			const newTask = (await createDailyTask(payload)) as unknown as DailyTask

			setTasks(prev => [...prev, newTask])
			setNewTaskTitle('')
			setIsCreating(false)
		} catch (error) {
			console.error('Failed to create task:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleToggleTask = async (taskId: string, newStatus: boolean) => {
		const previousTasks = [...tasks]

		setTasks(prev => prev.map(item => (item.$id === taskId ? { ...item, isCompleted: newStatus } : item)))

		try {
			await updateDailyTask(taskId, { isCompleted: newStatus })
		} catch (error) {
			console.error('Failed to update task status:', error)
			setTasks(previousTasks)
		}
	}

	const handleDeleteTask = async (taskId: string) => {
		if (!window.confirm('Are you sure you want to delete this task?')) return

		const previousTasks = [...tasks]

		try {
			setTasks(prev => prev.filter(item => item.$id !== taskId))

			await deleteDailyTask(taskId)
		} catch (error) {
			console.error('Failed to delete task:', error)
			setTasks(previousTasks)
		}
	}

	useEffect(() => {
		getDailyTasks()
	}, [date])

	return (
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
									onDelete={() => handleDeleteTask(task.$id)}
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
				<svg width='18' height='18' viewBox='0 0 22 23' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M10.6066 1.15219C10.4409 1.15222 10.2819 1.21806 10.1647 1.33525C10.0476 1.45244 9.98171 1.61138 9.98169 1.77711L9.98169 10.8751L0.88371 10.8751C0.71798 10.8751 0.559044 10.941 0.441855 11.0581C0.324666 11.1753 0.258819 11.3343 0.258794 11.5C0.258819 11.6657 0.324666 11.8247 0.441855 11.9419C0.559044 12.059 0.71798 12.1249 0.88371 12.1249L9.98169 12.1249L9.98169 21.2229C9.98171 21.3886 10.0476 21.5476 10.1647 21.6647C10.2819 21.7819 10.4409 21.8478 10.6066 21.8478C10.7723 21.8478 10.9313 21.7819 11.0485 21.6647C11.1656 21.5476 11.2315 21.3886 11.2315 21.2229L11.2315 12.1249H20.3295C20.4952 12.1249 20.6542 12.059 20.7713 11.9419C20.8885 11.8247 20.9544 11.6657 20.9544 11.5C20.9544 11.3343 20.8885 11.1753 20.7713 11.0581C20.6542 10.941 20.4952 10.8751 20.3295 10.8751H11.2315L11.2315 1.77711C11.2315 1.61138 11.1656 1.45244 11.0485 1.33525C10.9313 1.21806 10.7723 1.15222 10.6066 1.15219Z'
						fill='var(--text)'
					/>
				</svg>
				<span>Add new task</span>
			</button>
			<button className={classes.closeButton} onClick={() => onClose()}>
				<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<circle cx='10' cy='10' r='10' fill='#262525' />
					<path
						d='M15.8536 4.1464C15.7598 4.05266 15.6327 4 15.5001 4C15.3675 4 15.2404 4.05266 15.1466 4.1464L10 9.29299L4.85341 4.1464C4.75964 4.05266 4.63249 4 4.4999 4C4.36732 4 4.24016 4.05266 4.1464 4.1464C4.05266 4.24016 4 4.36732 4 4.4999C4 4.63249 4.05266 4.75964 4.1464 4.85341L9.29299 10L4.1464 15.1466C4.05266 15.2404 4 15.3675 4 15.5001C4 15.6327 4.05266 15.7598 4.1464 15.8536C4.24016 15.9473 4.36732 16 4.4999 16C4.63249 16 4.75964 15.9473 4.85341 15.8536L10 10.707L15.1466 15.8536C15.2404 15.9473 15.3675 16 15.5001 16C15.6327 16 15.7598 15.9473 15.8536 15.8536C15.9473 15.7598 16 15.6327 16 15.5001C16 15.3675 15.9473 15.2404 15.8536 15.1466L10.707 10L15.8536 4.85341C15.9473 4.75964 16 4.63249 16 4.4999C16 4.36732 15.9473 4.24016 15.8536 4.1464Z'
						fill='white'
					/>
				</svg>
			</button>
		</div>
	)
}
