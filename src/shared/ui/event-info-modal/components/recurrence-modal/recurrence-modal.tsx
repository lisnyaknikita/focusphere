'use client'

import { RecurrencePicker } from '@/app/(main)/planner/components/header/recurrence-picker/recurrence-picker'
import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { CalendarActions } from '@/shared/hooks/calendar/use-event-form'
import { getDateForDayOfWeek } from '@/shared/hooks/planner/use-timeblock-form'
import { TimeBlockForm } from '@/shared/types/time-block'
import { Modal } from '@/shared/ui/modal/modal'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { toast } from 'sonner'
import classes from '../../event-info-modal.module.scss'

interface RecurrenceModalProps {
	isOpen: boolean
	onClose: () => void
	event: SXEvent
	createAction?: CalendarActions['create']
	onUpdated?: () => void
}

export const RecurrenceModal = ({ isOpen, onClose, event, createAction, onUpdated }: RecurrenceModalProps) => {
	const [repeatForm, setRepeatForm] = useState({ repeatDays: [] as number[] })

	if (!createAction) return null

	const startStr = event.start.toString()
	const endStr = event.end.toString()
	const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
	const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'
	const baseDateMatch = startStr.match(/(\d{4}-\d{2}-\d{2})/)
	const baseDateString = baseDateMatch ? baseDateMatch[1] : new Date().toISOString().slice(0, 10)

	const currentEventDayIndex = new Date(baseDateString + 'T00:00:00').getDay()

	const handleApplyRecurrence = async () => {
		if (repeatForm.repeatDays.length === 0) return

		try {
			const userId = await getCurrentUserId()
			const createPromises = repeatForm.repeatDays.map(dayIndex => {
				const targetDate = getDateForDayOfWeek(baseDateString, dayIndex)
				return createAction({
					title: event.title || 'Untitled Block',
					startDate: `${targetDate}T${startTime}:00.000Z`,
					endDate: `${targetDate}T${endTime}:00.000Z`,
					color: event.color || '#D79716',
					calendarId: getCalendarIdByColor(event.color || '#D79716'),
					userId,
				})
			})

			const batchExecution = Promise.all(createPromises)

			toast.promise(batchExecution, {
				loading: 'Duplicating time block...',
				success: 'Time block duplicated successfully',
				error: 'Failed to duplicate time block',
			})

			await batchExecution
			setRepeatForm({ repeatDays: [] })
			onUpdated?.()
			onClose()
		} catch (error) {
			console.error('Recurrence replication failed:', error)
		}
	}

	return (
		<Modal isVisible={isOpen} onClose={onClose}>
			<div className={classes.recurrenceModalInner}>
				<h5>Duplicate Block</h5>
				<p className={classes.recurrenceDesc}>
					Select days of the current week to repeat this event with the same time.
				</p>

				<RecurrencePicker
					form={repeatForm as TimeBlockForm}
					setFormField={(key, value) => setRepeatForm(prev => ({ ...prev, [key]: value }))}
					disabledDay={currentEventDayIndex}
				/>

				<div className={classes.recurrenceActions}>
					<button onClick={onClose} className={classes.cancelBtn}>
						Cancel
					</button>
					<button
						onClick={handleApplyRecurrence}
						className={classes.confirmBtn}
						disabled={repeatForm.repeatDays.length === 0}
					>
						Apply
					</button>
				</div>
			</div>
		</Modal>
	)
}
