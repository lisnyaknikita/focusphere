'use client'

import { createDailyTask } from '@/lib/planner/planner'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { SprintDatePicker } from '@/shared/ui/sprint-datepicker/sprint-datepicker'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'
import classes from './convert-idea-task-modal.module.scss'

interface ConvertIdeaToTaskModalProps {
	isOpen: boolean
	ideaText: string
	ideaId: string
	onClose: () => void
	onSuccess: (ideaId: string) => Promise<void>
}

export const ConvertIdeaToTaskModal = ({
	isOpen,
	ideaText,
	ideaId,
	onClose,
	onSuccess,
}: ConvertIdeaToTaskModalProps) => {
	const [title, setTitle] = useState(ideaText)
	const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { user } = useUser()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!title.trim() || isSubmitting || !user) return

		setIsSubmitting(true)
		try {
			await createDailyTask({
				title: title.trim(),
				date: selectedDate,
				isCompleted: false,
				order: Date.now(),
				userId: user.$id,
			})

			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('refresh-daily-tasks'))
			}
			await onSuccess(ideaId)
			toast.success('Converted to Task!')
			onClose()
		} catch {
			toast.error('Failed to create task')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Modal isVisible={isOpen} onClose={onClose}>
			<div className={classes.modalInner}>
				<h4 className={classes.title}>Convert Idea to Task</h4>
				<button className={classes.closeButton} onClick={onClose} aria-label='Close modal' type='button'>
					<CloseIcon width={20} height={20} />
				</button>

				<form onSubmit={handleSubmit} className={classes.form}>
					<label className={classes.fieldLabel}>Task Title</label>
					<div className={classes.newTaskItem}>
						<input
							type='text'
							className={classes.inlineInput}
							value={title}
							onChange={e => setTitle(e.target.value)}
							placeholder='Task title...'
							autoFocus
						/>
					</div>

					<label className={classes.fieldLabel}>Target Date</label>
					<div className={classes.dateWrapper}>
						<SprintDatePicker value={selectedDate} onChange={setSelectedDate} placeholder='Select date' />
					</div>

					<button type='submit' className={classes.submitButton} disabled={isSubmitting || !title.trim()}>
						{isSubmitting ? 'Creating...' : 'Create Task'}
					</button>
				</form>
			</div>
		</Modal>
	)
}
