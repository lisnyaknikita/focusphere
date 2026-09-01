'use client'

import { createTimeBlock, updateTimeBlock } from '@/lib/planner/planner'
import { useCalendarScroll } from '@/shared/hooks/planner/use-calendar-scroll'
import { DragSelectionInfo } from '@/shared/hooks/planner/use-grid-drag-create'
import { useTimeBlockDeletion } from '@/shared/hooks/planner/use-timeblock-deletion'
import { TimeBlock } from '@/shared/types/time-block'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'
import { memo, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import 'temporal-polyfill/global'
import { WeekDayHeader } from './components/week-day-header/week-day-header'
import classes from './planner-inner.module.scss'

interface PlannerInnerProps {
	timeBlocks: TimeBlock[]
	calendar: ReturnType<typeof useNextCalendarApp>
	eventsService: ReturnType<typeof createEventsServicePlugin>
	eventModal: ReturnType<typeof createEventModalPlugin>
	onDayClick: (date: string) => void
	onCopyEvent: (event: SXEvent) => void
	refreshTimeBlocks: () => void
	selectionInfo?: DragSelectionInfo | null
}

export const PlannerInner = memo(
	({
		timeBlocks,
		onDayClick,
		onCopyEvent,
		calendar,
		eventsService,
		eventModal,
		refreshTimeBlocks,
		selectionInfo,
	}: PlannerInnerProps) => {
		const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)
		const { handleDelete } = useTimeBlockDeletion({ eventsService, eventModal })

		useCalendarScroll({
			dependencies: [timeBlocks.length],
			scrollOnlyOnce: true,
		})

		const handleConfirmDelete = async () => {
			if (eventToDelete) {
				await handleDelete(String(eventToDelete.id))
				setEventToDelete(null)
			}
		}

		const customComponents = useMemo(
			() => ({
				eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => (
					<EventInfoModal
						event={calendarEvent}
						isTimeBlock
						onConfirmDelete={() => setEventToDelete(calendarEvent)}
						onUpdated={() => {
							refreshTimeBlocks()
							eventModal.close()
						}}
						onCopy={() => {
							onCopyEvent(calendarEvent)
							eventModal.close()
						}}
						actions={{
							create: createTimeBlock,
							update: updateTimeBlock,
						}}
					/>
				),
				weekGridDate: ({ date }: { date: string }) => <WeekDayHeader date={date} onDayClick={onDayClick} />,
			}),
			[onDayClick, refreshTimeBlocks, onCopyEvent]
		)

		return (
			<>
				<ScheduleXCalendar customComponents={customComponents} calendarApp={calendar} />
				{selectionInfo?.columnEl &&
					createPortal(
						<div
							className={classes.dragSelection}
							style={{
								top: `${selectionInfo.topPx}px`,
								height: `${selectionInfo.heightPx}px`,
							}}
						>
							<span className={classes.dragTitle}>New Block</span>
							<span className={classes.dragTime}>
								{selectionInfo.startTimeStr} – {selectionInfo.endTimeStr}
							</span>
						</div>,
						selectionInfo.columnEl
					)}
				<ConfirmModal
					isVisible={!!eventToDelete}
					onClose={() => setEventToDelete(null)}
					onConfirm={handleConfirmDelete}
					title='Delete Time Block'
					message={
						<>
							Are you sure you want to delete &quot;<span className='highlight'>{eventToDelete?.title}</span>&quot;?
						</>
					}
				/>
			</>
		)
	}
)

PlannerInner.displayName = 'PlannerInner'
