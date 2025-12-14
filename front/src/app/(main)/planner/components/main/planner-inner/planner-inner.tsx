import { mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { useTimeBlockDeletion } from '@/shared/hooks/planner/use-timeblock-deletion'
import { TimeBlock } from '@/shared/types/time-block'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useMemo } from 'react'
import 'temporal-polyfill/global'

interface PlannerInnerProps {
	timeBlocks: TimeBlock[]
}

export const PlannerInner = ({ timeBlocks }: PlannerInnerProps) => {
	const { calendar, eventsService, eventModal } = useCalendarApp()

	const { handleDelete } = useTimeBlockDeletion({ eventsService, eventModal })

	const customComponents = useMemo(
		() => ({
			eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => (
				<EventInfoModal event={calendarEvent} onConfirmDelete={handleDelete} />
			),
		}),
		[handleDelete]
	)

	useEffect(() => {
		eventsService.set(timeBlocks.map(mapTimeBlockToScheduleX))
	}, [timeBlocks, eventsService])

	useEffect(() => {
		const timeout = setTimeout(() => {
			const el = document.querySelector('.sx__current-time-indicator')

			if (el) {
				el.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}, 50)

		return () => clearTimeout(timeout)
	}, [])

	return <ScheduleXCalendar customComponents={customComponents} calendarApp={calendar} />
}
