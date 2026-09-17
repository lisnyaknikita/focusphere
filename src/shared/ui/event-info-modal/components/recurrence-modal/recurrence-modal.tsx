'use client'

import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { CalendarActions } from '@/shared/hooks/calendar/use-event-form'
import { Modal } from '@/shared/ui/modal/modal'
import { localDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { toast } from 'sonner'
import 'temporal-polyfill/global'
import classes from '../../event-info-modal.module.scss'

const getDateForDayOfWeek = (baseDateString: string, targetDay: number): string => {
	const plainDate = Temporal.PlainDate.from(baseDateString)
	const currentDay = plainDate.dayOfWeek
	return plainDate.add({ days: targetDay - currentDay }).toString()
}

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
	const baseDateString = baseDateMatch ? baseDateMatch[1] : Temporal.Now.plainDateISO().toString()

	// const currentEventDayIndex = Temporal.PlainDate.from(baseDateString).dayOfWeek

	const handleApplyRecurrence = async () => {
		if (repeatForm.repeatDays.length === 0) return

		try {
			const userId = await getCurrentUserId()
			const createPromises = repeatForm.repeatDays.map(dayIndex => {
				const targetDate = getDateForDayOfWeek(baseDateString, dayIndex)
				return createAction({
					title: event.title || 'Untitled event',
					description: event.description as string | undefined,
					startDate: localDateTimeToInstant(targetDate, startTime),
					endDate: localDateTimeToInstant(targetDate, endTime),
					color: (event.color as string) || '#D79716',
					calendarId: getCalendarIdByColor((event.color as string) || '#D79716'),
					userId,
				})
			})

			const batchExecution = Promise.all(createPromises)

			toast.promise(batchExecution, {
				loading: 'Creating event copies...',
				success: 'Event copies created',
				error: 'Failed to create event copies',
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
				<h5>Repeat event</h5>
				<p className={classes.recurrenceDesc}>
					Select days of the current week to repeat this event with the same time.
				</p>

				{/* <RecurrencePicker
					form={repeatForm as EventForm}
					setFormField={(key, value) => setRepeatForm(prev => ({ ...prev, [key]: value }))}
					disabledDay={currentEventDayIndex}
				/> */}

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
