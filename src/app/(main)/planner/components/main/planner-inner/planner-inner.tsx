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
import { useQueryClient } from '@tanstack/react-query'
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
		const queryClient = useQueryClient()
		const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)

		const { handleDelete: handleDeleteTimeBlock } = useTimeBlockDeletion({ eventsService, eventModal })
		const { handleDelete: handleDeleteCalendarEvent } = useEventDeletion({ eventsService, eventModal })
		const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()

		useCalendarScroll({
			dependencies: [timeBlocks.length],
			scrollOnlyOnce: true,
		})

		const handleConfirmDelete = async () => {
			if (eventToDelete) {
				const id = String(eventToDelete.id)
				const isCalendar = Boolean(
					eventToDelete._isCalendarEvent || id.startsWith('g_') || eventToDelete.title?.startsWith('📅')
				)
				if (isCalendar) {
					await handleDeleteCalendarEvent(id)
					queryClient.invalidateQueries({ queryKey: ['events-appwrite'] })
					queryClient.invalidateQueries({ queryKey: ['events-google'] })
				} else {
					await handleDeleteTimeBlock(id)
				}
				setEventToDelete(null)
			}
		}

		const customComponents = useMemo(
			() => ({
				eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => {
					const isCalendar = Boolean(
						calendarEvent._isCalendarEvent ||
							String(calendarEvent.id).startsWith('g_') ||
							calendarEvent.title?.startsWith('📅')
					)

					return (
						<EventInfoModal
							event={calendarEvent}
							isTimeBlock={!isCalendar}
							onConfirmDelete={() => setEventToDelete(calendarEvent)}
							onUpdated={() => {
								refreshTimeBlocks()
								if (isCalendar) {
									queryClient.invalidateQueries({ queryKey: ['events-appwrite'] })
									queryClient.invalidateQueries({ queryKey: ['events-google'] })
								}
								eventModal.close()
							}}
							onCopy={
								!isCalendar
									? () => {
											onCopyEvent(calendarEvent)
											eventModal.close()
									  }
									: undefined
							}
							actions={
								isCalendar
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
					isVisible={!!eventToDelete}
					onClose={() => setEventToDelete(null)}
					onConfirm={handleConfirmDelete}
					title={
						eventToDelete &&
						(eventToDelete._isCalendarEvent ||
							String(eventToDelete.id).startsWith('g_') ||
							eventToDelete.title?.startsWith('📅'))
							? 'Delete Calendar Event'
							: 'Delete Time Block'
					}
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
