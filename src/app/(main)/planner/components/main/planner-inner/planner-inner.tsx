import { createTimeBlock, updateTimeBlock } from '@/lib/planner/planner'
import { useCalendarScroll } from '@/shared/hooks/planner/use-calendar-scroll'
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
import 'temporal-polyfill/global'
import { WeekDayHeader } from './components/week-day-header/week-day-header'

interface PlannerInnerProps {
	timeBlocks: TimeBlock[]
	calendar: ReturnType<typeof useNextCalendarApp>
	eventsService: ReturnType<typeof createEventsServicePlugin>
	eventModal: ReturnType<typeof createEventModalPlugin>
	onDayClick: (date: string) => void
	onCopyEvent: (event: SXEvent) => void
	refreshTimeBlocks: () => void
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
