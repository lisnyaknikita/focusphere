'use client'

import { useSprints } from '@/shared/hooks/projects/sprints/use-sprints'
import { Sprint } from '@/shared/types/sprint'
import { useState } from 'react'
import { toast } from 'sonner'
import { SprintDatePicker } from '../../sprint-datepicker/sprint-datepicker'
import classes from './edit-sprint-modal.module.scss'

interface EditSprintModalProps {
	projectId: string
	sprint: Sprint
	onClose: () => void
}

const formatDateToIso = (dateStr?: string) => {
	if (!dateStr) return new Date().toISOString().split('T')[0]
	try {
		return new Date(dateStr).toISOString().split('T')[0]
	} catch {
		return new Date().toISOString().split('T')[0]
	}
}

export const EditSprintModal = ({ projectId, sprint, onClose }: EditSprintModalProps) => {
	const { updateSprint } = useSprints(projectId)

	const [name, setName] = useState(sprint.name)
	const [goal, setGoal] = useState(sprint.goal || '')
	const [startDate, setStartDate] = useState(formatDateToIso(sprint.startDate))
	const [endDate, setEndDate] = useState(formatDateToIso(sprint.endDate))
	const [isSubmitting, setIsSubmitting] = useState(false)

	const isDateRangeInvalid = new Date(endDate) <= new Date(startDate)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim() || isDateRangeInvalid) return

		setIsSubmitting(true)
		try {
			await updateSprint({
				sprintId: sprint.$id,
				data: {
					name: name.trim(),
					goal: goal.trim() || undefined,
					startDate: new Date(startDate).toISOString(),
					endDate: new Date(endDate).toISOString(),
				},
			})
			onClose()
		} catch (error) {
			console.error(error)
			toast.error('Failed to update sprint details')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className={classes.modal}>
			<h3 className={classes.title}>Edit Sprint Details</h3>
			<form onSubmit={handleSubmit} className={classes.form}>
				<div className={classes.field}>
					<label htmlFor='edit-sprint-name'>Sprint Name</label>
					<input
						id='edit-sprint-name'
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='e.g. Sprint 1'
						required
					/>
				</div>
				<div className={classes.field}>
					<label htmlFor='edit-sprint-goal'>Sprint Goal</label>
					<textarea
						id='edit-sprint-goal'
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
					<button type='submit' className={classes.submitBtn} disabled={isSubmitting || !name.trim()}>
						{isSubmitting ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	)
}
