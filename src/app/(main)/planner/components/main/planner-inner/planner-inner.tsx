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
import { useMemo, useState } from 'react'
import 'temporal-polyfill/global'
import { WeekDayHeader } from './components/week-day-header/week-day-header'

interface PlannerInnerProps {
	timeBlocks: TimeBlock[]
	dailyTasksCountByDate: Record<string, number>
	calendar: ReturnType<typeof useNextCalendarApp>
	eventsService: ReturnType<typeof createEventsServicePlugin>
	eventModal: ReturnType<typeof createEventModalPlugin>
	onDayClick: (date: string) => void
}

export const PlannerInner = ({
	timeBlocks,
	onDayClick,
	dailyTasksCountByDate,
	calendar,
	eventsService,
	eventModal,
}: PlannerInnerProps) => {
	const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)
	const { handleDelete } = useTimeBlockDeletion({ eventsService, eventModal })

	useCalendarScroll([timeBlocks])

	const handleConfirmDelete = async () => {
		if (eventToDelete) {
			await handleDelete(String(eventToDelete.id))
			setEventToDelete(null)
		}
	}

	const customComponents = useMemo(
		() => ({
			eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => (
				<EventInfoModal event={calendarEvent} onConfirmDelete={() => setEventToDelete(calendarEvent)} />
			),
			weekGridDate: ({ date }: { date: string }) => (
				<WeekDayHeader date={date} onDayClick={onDayClick} incompleteTasksCount={dailyTasksCountByDate[date] ?? 0} />
			),
		}),
		[, onDayClick, dailyTasksCountByDate]
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
