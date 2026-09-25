import { CALENDARS_CONFIG, getCalendarIdByColor } from '@/lib/events/calendar-config'
import { useBilling } from '@/shared/context/billing-context'
import { CalendarActions, useEventForm } from '@/shared/hooks/calendar/use-event-form'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { RecurrenceActionModal, RecurrenceScope } from '@/shared/ui/recurrence-action-modal/recurrence-action-modal'
import { getRecurrenceSummary, isRecurrenceInstanceId } from '@/shared/utils/calendar/recurrence'
import { formatDateRange } from '@/shared/utils/format-date-range/format-date-range'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import clsx from 'clsx'
import { useState } from 'react'
import { ActionTooltip } from '../action-tooltip/action-tooltip'
import { DateTimeIcon } from '../icons/calendar/date-time-icon'
import { DescriptionIcon } from '../icons/calendar/description-icon'
import { DeleteIcon } from '../icons/delete-icon'
import { EditIcon } from '../icons/edit-icon'
import { CopyEventIcon } from '../icons/planner/copy-timeblock-icon'
import { RepeatIcon } from '../icons/planner/repeat-icon'
import { EventEditView } from './components/event-edit-view/event-edit-view'
import classes from './event-info-modal.module.scss'

interface EventInfoModalProps {
	event: SXEvent
	onConfirmDelete?: (eventId: string) => Promise<void> | void
	onUpdated?: () => void
	onCopy?: () => void
	actions?: CalendarActions
	initialEditing?: boolean
	onCancelCreate?: () => void
}

const getDisplayColor = (color: string): string => {
	const calendarId = getCalendarIdByColor(color)
	const config = CALENDARS_CONFIG[calendarId as keyof typeof CALENDARS_CONFIG]
	return config?.darkColors.container || color
}

export const EventInfoModal = ({
	event,
	onConfirmDelete,
	onUpdated,
	onCopy,
	actions,
	initialEditing,
	onCancelCreate,
}: EventInfoModalProps) => {
	const timeFormat = useSettingsStore(state => state.timeFormat)
	const [isEditing, setIsEditing] = useState(initialEditing ?? false)
	const [isRecurrenceEditModalOpen, setIsRecurrenceEditModalOpen] = useState(false)

	const { isPro, openPaywall } = useBilling()

	const { form, setFormField, handleSubmit } = useEventForm(
		() => {
			setIsEditing(false)
			onUpdated?.()
		},
		event,
		actions
	)

	const formattedDate = formatDateRange(event.start, event.end, timeFormat)
	const isReadOnly = !onConfirmDelete

	const recurrenceRule = (event as unknown as { recurrenceRule?: string }).recurrenceRule
	const recurrenceSummary = recurrenceRule ? getRecurrenceSummary(recurrenceRule) : null

	const handleDelete = () => {
		if (onConfirmDelete) {
			onConfirmDelete(String(event.id))
		}
	}

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (isRecurrenceInstanceId(event.id)) {
			setIsRecurrenceEditModalOpen(true)
		} else {
			handleSubmit(e)
		}
	}

	const handleRecurrenceEditConfirm = (scope: RecurrenceScope) => {
		handleSubmit(undefined, scope)
	}

	if (isEditing) {
		return (
			<>
				<div className={classes.modalInner}>
					<EventEditView
						form={form}
						setFormField={setFormField}
						handleSubmit={handleEditSubmit}
						onCancel={() => (initialEditing && onCancelCreate ? onCancelCreate() : setIsEditing(false))}
					/>
				</div>
				<RecurrenceActionModal
					isVisible={isRecurrenceEditModalOpen}
					actionType='edit'
					eventTitle={event.title}
					onClose={() => setIsRecurrenceEditModalOpen(false)}
					onConfirm={handleRecurrenceEditConfirm}
				/>
			</>
		)
	}

	return (
		<div className={classes.modalInner}>
			<div className={classes.modalButtons}>
				{!isReadOnly && (
					<>
						{onCopy && (
							<ActionTooltip text={isPro ? 'Copy this event' : 'Copy this event (PRO)'} isActive={isPro}>
								{(setRef, refProps) => (
									<button
										ref={setRef}
										type='button'
										className={clsx(classes.copyBtn, !isPro && classes.proAction)}
										onClick={() => (!isPro ? openPaywall('planner_copying') : onCopy())}
										{...refProps}
									>
										<CopyEventIcon />
									</button>
								)}
							</ActionTooltip>
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
					<span style={{ backgroundColor: getDisplayColor(String(event.color || '')) }}></span>
					<h6>{event.title}</h6>
				</div>
				<div className={classes.date}>
					<span>
						<DateTimeIcon width={18} height={18} />
					</span>
					<p>{formattedDate}</p>
				</div>
				{recurrenceSummary && recurrenceSummary !== 'Does not repeat' && (
					<div className={classes.recurrenceRow}>
						<span>
							<RepeatIcon width={18} height={18} />
						</span>
						<p>{recurrenceSummary}</p>
					</div>
				)}
				{event.description && event.description.trim() !== '' && (
					<div className={classes.description} title={event.description}>
						<span>
							<DescriptionIcon width={18} height={18} />
						</span>
						<p>{event.description}</p>
					</div>
				)}
			</div>
		</div>
	)
}
