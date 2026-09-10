'use client'

import { createTimeBlock, updateTimeBlock } from '@/lib/planner/planner'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calnedar-mutations'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
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
import { useQueryClient } from '@tanstack/react-query'
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
		const queryClient = useQueryClient()
		const { handleDelete: handleDeleteTimeBlock } = useTimeBlockDeletion({ eventsService, eventModal })
		const { handleDelete: handleDeleteCalendarEvent } = useEventDeletion({ eventsService, eventModal })
		const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()

		const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string; isCalendarEvent: boolean } | null>(
			null
		)

		useCalendarScroll({ dependencies: [timeBlocks] })

		const handleConfirmDelete = async () => {
			if (itemToDelete) {
				const id = String(itemToDelete.id)
				if (itemToDelete.isCalendarEvent) {
					await handleDeleteCalendarEvent(id)
					queryClient.invalidateQueries({ queryKey: ['events-appwrite'] })
					queryClient.invalidateQueries({ queryKey: ['events-google'] })
				} else {
					await handleDeleteTimeBlock(id)
				}
				setItemToDelete(null)
			}
		}

		const customComponents = useMemo(
			() => ({
				eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => {
					const isCalendarEvent = Boolean(calendarEvent._isCalendarEvent || calendarEvent.title?.startsWith('📅'))
					const isTimeBlock = !isCalendarEvent && !String(calendarEvent.id).startsWith('g_')

					return (
						<EventInfoModal
							event={calendarEvent}
							isTimeBlock={isTimeBlock}
							onConfirmDelete={() => {
								setItemToDelete({
									id: String(calendarEvent.id),
									title: calendarEvent.title || '',
									isCalendarEvent,
								})
							}}
							onUpdated={() => {
								refreshTimeBlocks()
								eventModal.close()
							}}
							onCopy={isTimeBlock ? () => onCopyEvent(calendarEvent) : undefined}
							actions={
								isCalendarEvent
									? {
											create: handleCreateEvent,
											update: handleUpdateEvent,
									  }
									: {
											create: createTimeBlock,
											update: updateTimeBlock,
									  }
							}
						/>
					)
				},
				weekGridDate: ({ date }: { date: string }) => <WeekDayHeader date={date} onDayClick={onDayClick} />,
			}),
			[onDayClick, refreshTimeBlocks, onCopyEvent, queryClient, handleCreateEvent, handleUpdateEvent, eventModal]
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
					isVisible={!!itemToDelete}
					onClose={() => setItemToDelete(null)}
					onConfirm={handleConfirmDelete}
					title={itemToDelete?.isCalendarEvent ? 'Delete Calendar Event' : 'Delete Time Block'}
					message={
						<>
							Are you sure you want to delete &quot;<span className='highlight'>{itemToDelete?.title}</span>&quot;?
						</>
					}
				/>
			</>
		)
	}
)

PlannerInner.displayName = 'PlannerInner'
