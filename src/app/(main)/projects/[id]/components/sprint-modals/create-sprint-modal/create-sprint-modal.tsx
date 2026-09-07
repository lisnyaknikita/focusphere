'use client'

import { useSprints } from '@/shared/hooks/projects/sprints/use-sprints'
import { SprintDatePicker } from '@/shared/ui/sprint-datepicker/sprint-datepicker'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import classes from './create-sprint-modal.module.scss'

interface CreateSprintModalProps {
	projectId: string
	onClose: () => void
}

export const CreateSprintModal = ({ projectId, onClose }: CreateSprintModalProps) => {
	const { sprints, createSprint } = useSprints(projectId)

	const defaultStartDate = new Date().toISOString().split('T')[0]
	const defaultEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

	const [name, setName] = useState('')
	const [goal, setGoal] = useState('')
	const [startDate, setStartDate] = useState(defaultStartDate)
	const [endDate, setEndDate] = useState(defaultEndDate)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (sprints && !name) {
			setName(`Sprint ${sprints.length + 1}`)
		}
	}, [sprints, name])

	const isDateRangeInvalid = new Date(endDate) <= new Date(startDate)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim() || isDateRangeInvalid) return

		setIsSubmitting(true)
		try {
			await createSprint({
				projectId,
				name: name.trim(),
				goal: goal.trim() || undefined,
				startDate: new Date(startDate).toISOString(),
				endDate: new Date(endDate).toISOString(),
				status: 'planned',
			})
			onClose()
		} catch (error) {
			console.error(error)
			toast.error('Failed to create sprint')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className={classes.modal}>
			<h3 className={classes.title}>Create Sprint</h3>
			<form onSubmit={handleSubmit} className={classes.form}>
				<div className={classes.field}>
					<label htmlFor='sprint-name'>Sprint Name</label>
					<input
						id='sprint-name'
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='e.g. Sprint 1'
						required
						autoFocus
					/>
				</div>
				<div className={classes.field}>
					<label htmlFor='sprint-goal'>Sprint Goal (Optional)</label>
					<textarea
						id='sprint-goal'
						value={goal}
						onChange={e => setGoal(e.target.value)}
						placeholder='What is the primary goal of this sprint?'
					/>
				</div>
				<div className={classes.row}>
					<div className={classes.field}>
						<label>Start Date</label>
						<SprintDatePicker value={startDate} onChange={setStartDate} />
					</div>
					<div className={classes.field}>
						<label>End Date</label>
						<SprintDatePicker value={endDate} onChange={setEndDate} />
					</div>
				</div>
				{isDateRangeInvalid && <span className={classes.fieldError}>End date cannot be earlier or the same</span>}
				<div className={classes.actions}>
					<button type='button' className={classes.cancelBtn} onClick={onClose}>
						Cancel
					</button>
					<button
						type='submit'
						className={classes.submitBtn}
						disabled={isSubmitting || !name.trim() || isDateRangeInvalid}
					>
						{isSubmitting ? 'Creating...' : 'Create Sprint'}
					</button>
				</div>
			</form>
		</div>
	)
}
