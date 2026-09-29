import { EventPasteBanner } from '@/features/calendar/event-paste-banner'
import { DragSelectionInfo } from '@/shared/hooks/planner/use-grid-drag-create'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { RecurrenceActionModal } from '@/shared/ui/recurrence-action-modal/recurrence-action-modal'
import { isRecurrenceInstanceId } from '@/shared/utils/calendar/recurrence'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import classes from '../../calendar.module.scss'
import { DayEventsPopover } from '../day-events-popover/day-events-popover'

interface CalendarOverlaysProps {
	copiedEvent: SXEvent | null
	setCopiedEvent: (event: SXEvent | null) => void
	selectionInfo: DragSelectionInfo | null
	popoverState: { dateStr: string; anchorEl: HTMLElement } | null
	closePopover: () => void
	mappedEvents: SXEvent[]
	selectedEventForModal: SXEvent | null
	setSelectedEventForModal: (event: SXEvent | null) => void
	eventToDelete: SXEvent | null
	setEventToDelete: (event: SXEvent | null) => void
	renderEventInfoModal: (event: SXEvent, onCloseModal?: () => void) => ReactNode
	handleConfirmDelete: () => Promise<void>
	handleRecurrenceDelete: (scope: 'this' | 'all') => Promise<void>
}

export const CalendarOverlays = ({
	copiedEvent,
	setCopiedEvent,
	selectionInfo,
	popoverState,
	closePopover,
	mappedEvents,
	selectedEventForModal,
	setSelectedEventForModal,
	eventToDelete,
	setEventToDelete,
	renderEventInfoModal,
	handleConfirmDelete,
	handleRecurrenceDelete,
}: CalendarOverlaysProps) => {
	return (
		<>
			{copiedEvent && <EventPasteBanner copiedEvent={copiedEvent} onCancel={() => setCopiedEvent(null)} />}

			{selectionInfo?.columnEl &&
				createPortal(
					<div
						className={classes.dragSelection}
						style={{ top: `${selectionInfo.topPx}px`, height: `${selectionInfo.heightPx}px` }}
					>
						<span className={classes.dragTitle}>New Event</span>
						<span className={classes.dragTime}>
							{selectionInfo.startTimeStr} – {selectionInfo.endTimeStr}
						</span>
					</div>,
					selectionInfo.columnEl
				)}

			<DayEventsPopover
				dateStr={popoverState?.dateStr || null}
				anchorEl={popoverState?.anchorEl || null}
				events={mappedEvents}
				onClose={closePopover}
				onEventClick={setSelectedEventForModal}
			/>

			<Modal
				isVisible={Boolean(selectedEventForModal)}
				onClose={() => setSelectedEventForModal(null)}
				style={{ padding: 0, width: 400 }}
			>
				{selectedEventForModal && renderEventInfoModal(selectedEventForModal, () => setSelectedEventForModal(null))}
			</Modal>

			{eventToDelete &&
			(isRecurrenceInstanceId(eventToDelete.id) ||
				Boolean((eventToDelete as unknown as { recurrenceRule?: string }).recurrenceRule)) ? (
				<RecurrenceActionModal
					isVisible={Boolean(eventToDelete)}
					actionType='delete'
					eventTitle={eventToDelete.title}
					onClose={() => setEventToDelete(null)}
					onConfirm={handleRecurrenceDelete}
				/>
			) : (
				<ConfirmModal
					isVisible={Boolean(eventToDelete)}
					onClose={() => setEventToDelete(null)}
					onConfirm={handleConfirmDelete}
					title='Delete Event'
					message={
						<>
							Are you sure you want to delete &quot;<span className='highlight'>{eventToDelete?.title}</span>&quot;?
						</>
					}
				/>
			)}
		</>
	)
}
