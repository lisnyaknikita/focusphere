import { ColorPicker } from '@/app/(main)/calendar/components/event-modal/components/color-picker/color-picker'
import { DateTime } from '@/app/(main)/calendar/components/event-modal/components/date-time/date-time'
import { Description } from '@/app/(main)/calendar/components/event-modal/components/description/description'
import { CalendarActions, useEventForm } from '@/shared/hooks/calendar/use-event-form'
import { formatDateRange } from '@/shared/utils/format-date-range/format-date-range'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { DateTimeIcon } from '../icons/calendar/date-time-icon'
import { DescriptionIcon } from '../icons/calendar/description-icon'
import { DeleteIcon } from '../icons/delete-icon'
import { EditIcon } from '../icons/edit-icon'
import { CopyTimeBlockIcon } from '../icons/planner/copy-timeblock-icon'
import classes from './event-info-modal.module.scss'

interface EventInfoModalProps {
	event: SXEvent
	onConfirmDelete?: (eventId: string) => Promise<void> | void
	onUpdated?: () => void
	onCopy?: () => void
	actions?: CalendarActions
}

export const EventInfoModal = ({ event, onConfirmDelete, onUpdated, onCopy, actions }: EventInfoModalProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [isCopyTooltipOpen, setIsCopyTooltipOpen] = useState(false)

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

	const { refs, floatingStyles, context } = useFloating({
		open: isCopyTooltipOpen,
		onOpenChange: setIsCopyTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	if (isEditing) {
		return (
			<div className={classes.modalInner}>
				<form onSubmit={handleSubmit} className={classes.editForm}>
					<input
						className={classes.titleInput}
						value={form.title}
						onChange={e => setFormField('title', e.target.value)}
						autoFocus
					/>
					<DateTime form={form} setFormField={setFormField} />
					<Description form={form} setFormField={setFormField} />
					<ColorPicker form={form} setFormField={setFormField} />

					<div className={classes.actions}>
						<button type='submit' className={classes.saveBtn}>
							Save
						</button>
						<button type='button' className={classes.cancelBtn} onClick={() => setIsEditing(false)}>
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
									ref={refs.setReference}
									type='button'
									className={classes.copyBtn}
									onClick={onCopy}
									{...getReferenceProps()}
								>
									<CopyTimeBlockIcon />
								</button>

								{isCopyTooltipOpen && (
									<div
										ref={refs.setFloating}
										style={{
											...floatingStyles,
											background: 'var(--save-button-bg)',
											color: 'var(--save-button-text)',
											padding: '4px 8px',
											borderRadius: '5px',
											fontSize: '12px',
											fontWeight: 700,
											zIndex: 1000,
											whiteSpace: 'nowrap',
										}}
										{...getFloatingProps()}
									>
										Copy this time block
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
		</div>
	)
}
