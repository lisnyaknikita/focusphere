import { ColorPicker } from '@/app/(main)/calendar/components/event-modal/components/color-picker/color-picker'
import { DateTime } from '@/app/(main)/calendar/components/event-modal/components/date-time/date-time'
import { Description } from '@/app/(main)/calendar/components/event-modal/components/description/description'
import { RecurrencePicker } from '@/app/(main)/planner/components/header/recurrence-picker/recurrence-picker'
import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { useBilling } from '@/shared/context/billing-context'
import { CalendarActions, useEventForm } from '@/shared/hooks/calendar/use-event-form'
import { getDateForDayOfWeek } from '@/shared/hooks/planner/use-timeblock-form'
import { TimeBlockForm } from '@/shared/types/time-block'
import { formatDateRange } from '@/shared/utils/format-date-range/format-date-range'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import clsx from 'clsx'
import { useState } from 'react'
import { toast } from 'sonner'
import { DateTimeIcon } from '../icons/calendar/date-time-icon'
import { DescriptionIcon } from '../icons/calendar/description-icon'
import { DeleteIcon } from '../icons/delete-icon'
import { EditIcon } from '../icons/edit-icon'
import { CopyTimeBlockIcon } from '../icons/planner/copy-timeblock-icon'
import { RepeatIcon } from '../icons/planner/repeat-icon'
import { Modal } from '../modal/modal'
import classes from './event-info-modal.module.scss'

interface EventInfoModalProps {
	event: SXEvent
	onConfirmDelete?: (eventId: string) => Promise<void> | void
	onUpdated?: () => void
	onCopy?: () => void
	actions?: CalendarActions
	initialEditing?: boolean
	onCancelCreate?: () => void
	isTimeBlock?: boolean
}

export const EventInfoModal = ({
	event,
	onConfirmDelete,
	onUpdated,
	onCopy,
	actions,
	initialEditing,
	onCancelCreate,
	isTimeBlock,
}: EventInfoModalProps) => {
	const [isEditing, setIsEditing] = useState(initialEditing ?? false)
	const [isCopyTooltipOpen, setIsCopyTooltipOpen] = useState(false)
	const [isRecurTooltipOpen, setIsRecurTooltipOpen] = useState(false)
	const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false)
	const [repeatForm, setRepeatForm] = useState({ repeatDays: [] as number[] })

	const { isPro, openPaywall } = useBilling()

	const { form, setFormField, handleSubmit } = useEventForm(
		() => {
			setIsEditing(false)
			onUpdated?.()
		},
		event,
		actions
	)

	const formattedDate = formatDateRange(event.start, event.end)

	const isReadOnly = !onConfirmDelete

	const handleDelete = () => {
		if (onConfirmDelete) {
			onConfirmDelete(String(event.id))
		}
	}

	const handleApplyRecurrence = async () => {
		if (!actions?.create || repeatForm.repeatDays.length === 0) return

		try {
			const userId = await getCurrentUserId()
			const startStr = event.start.toString()

			const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
			const endStr = event.end.toString()
			const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'
			const baseDateMatch = startStr.match(/(\d{4}-\d{2}-\d{2})/)
			const baseDateString = baseDateMatch ? baseDateMatch[1] : new Date().toISOString().slice(0, 10)

			const createPromises = repeatForm.repeatDays.map(dayIndex => {
				const targetDate = getDateForDayOfWeek(baseDateString, dayIndex)

				return actions.create!({
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
			setIsRecurrenceModalOpen(false)
			setRepeatForm({ repeatDays: [] })
			onUpdated?.()
		} catch (error) {
			console.error('Recurrence replication failed:', error)
		}
	}

	const {
		refs: copyRefs,
		floatingStyles: copyFloatingStyles,
		context: copyContext,
	} = useFloating({
		open: isCopyTooltipOpen,
		onOpenChange: setIsCopyTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})
	const copyHover = useHover(copyContext)
	const { getReferenceProps: getCopyReferenceProps, getFloatingProps: getCopyFloatingProps } = useInteractions([
		copyHover,
	])

	const {
		refs: recurRefs,
		floatingStyles: recurFloatingStyles,
		context: recurContext,
	} = useFloating({
		open: isRecurTooltipOpen,
		onOpenChange: setIsRecurTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})

	const recurHover = useHover(recurContext)
	const { getReferenceProps: getRecurReferenceProps, getFloatingProps: getRecurFloatingProps } = useInteractions([
		recurHover,
	])

	const startStr = event.start.toString()
	const baseDateMatch = startStr.match(/(\d{4}-\d{2}-\d{2})/)
	const baseDateString = baseDateMatch ? baseDateMatch[1] : new Date().toISOString().slice(0, 10)
	const currentEventDayIndex = new Date(baseDateString + 'T00:00:00').getDay()

	if (isEditing) {
		return (
			<div className={classes.modalInner}>
				<form onSubmit={handleSubmit} className={classes.editForm}>
					<input
						className={classes.titleInput}
						value={form.title}
						placeholder='Title...'
						onChange={e => setFormField('title', e.target.value)}
						autoFocus
					/>
					<DateTime form={form} setFormField={setFormField} />
					{!isTimeBlock && <Description form={form} setFormField={setFormField} />}
					<ColorPicker form={form} setFormField={setFormField} />

					<div className={classes.actions}>
						<button type='submit' className={classes.saveBtn}>
							Save
						</button>
						<button
							type='button'
							className={classes.cancelBtn}
							onClick={() => {
								if (initialEditing && onCancelCreate) {
									onCancelCreate()
								} else {
									setIsEditing(false)
								}
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		)
	}

	return (
		<div className={classes.modalInner}>
			<div className={classes.modalButtons}>
				{!isReadOnly && (
					<>
						{onCopy && (
							<div style={{ display: 'inline-block' }}>
								<button
									ref={copyRefs.setReference}
									type='button'
									className={clsx(classes.copyBtn, !isPro && classes.proAction)}
									onClick={() => {
										if (!isPro) {
											openPaywall('planner_copying')
											return
										}
										onCopy()
									}}
									{...getCopyReferenceProps()}
								>
									<CopyTimeBlockIcon />
								</button>

								{isCopyTooltipOpen && (
									<div
										ref={copyRefs.setFloating}
										style={{
											...copyFloatingStyles,
											background: !isPro ? '#d79716' : 'var(--save-button-bg)',
											color: 'var(--save-button-text)',
											padding: '4px 8px',
											borderRadius: '5px',
											fontSize: '12px',
											fontWeight: 700,
											zIndex: 1000,
											whiteSpace: 'nowrap',
										}}
										{...getCopyFloatingProps()}
									>
										{isPro ? 'Copy this time block' : 'Copy this time block (PRO)'}
									</div>
								)}
							</div>
						)}
						{isTimeBlock && (
							<div style={{ display: 'inline-block' }}>
								<button
									ref={recurRefs.setReference}
									type='button'
									className={clsx(classes.recurrenceBtn, !isPro && classes.proAction)}
									onClick={() => {
										if (!isPro) {
											openPaywall('planner_recurrence')
											return
										}
										setIsRecurrenceModalOpen(true)
									}}
									{...getRecurReferenceProps()}
								>
									<RepeatIcon />
								</button>
								{isRecurTooltipOpen && (
									<div
										ref={recurRefs.setFloating}
										style={{
											...recurFloatingStyles,
											background: !isPro ? '#d79716' : 'var(--save-button-bg)',
											color: 'var(--save-button-text)',
											padding: '4px 8px',
											borderRadius: '5px',
											fontSize: '12px',
											fontWeight: 700,
											zIndex: 1000,
											whiteSpace: 'nowrap',
										}}
										{...getRecurFloatingProps()}
									>
										{isPro ? 'Repeat this block' : 'Repeat this block (PRO)'}
									</div>
								)}
							</div>
						)}
						<button className={classes.editButton} onClick={() => setIsEditing(true)}>
							<EditIcon />
						</button>
						<button className={classes.deleteButton} onClick={handleDelete}>
							<DeleteIcon width={18} height={18} />
						</button>
					</>
				)}
			</div>
			<div className={classes.modalContent}>
				<div className={classes.title}>
					<span style={{ backgroundColor: `${event.color}` }}></span>
					<h6>{event.title}</h6>
				</div>
				<div className={classes.date}>
					<span>
						<DateTimeIcon width={18} height={18} />
					</span>
					<p>{formattedDate}</p>
				</div>
				{event.description && event.description.trim() !== '' && (
					<div className={classes.description} title={event.description}>
						<span>
							<DescriptionIcon width={18} height={18} />
						</span>
						<p>{event.description}</p>
					</div>
				)}
			</div>
			<Modal isVisible={isRecurrenceModalOpen} onClose={() => setIsRecurrenceModalOpen(false)}>
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
						<button onClick={() => setIsRecurrenceModalOpen(false)} className={classes.cancelBtn}>
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
		</div>
	)
}
