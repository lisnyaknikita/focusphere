import { mapTimeBlockToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/planner/use-calendar-app'
import { useTimeBlockDeletion } from '@/shared/hooks/planner/use-timeblock-deletion'
import { TimeBlock } from '@/shared/types/time-block'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useMemo, useRef } from 'react'
import 'temporal-polyfill/global'
import { WeekDayHeader } from './components/week-day-header/week-day-header'

interface PlannerInnerProps {
	timeBlocks: TimeBlock[]
	onDayClick: (date: string) => void
}

export const PlannerInner = ({ timeBlocks, onDayClick }: PlannerInnerProps) => {
	const { calendar, eventsService, eventModal } = useCalendarApp()

	const { handleDelete } = useTimeBlockDeletion({ eventsService, eventModal })

	const isInitialScrollDone = useRef(false)

	const customComponents = useMemo(
		() => ({
			eventModal: ({ calendarEvent }: { calendarEvent: SXEvent }) => (
				<EventInfoModal event={calendarEvent} onConfirmDelete={handleDelete} />
			),
			weekGridDate: ({ date }: { date: string }) => <WeekDayHeader date={date} onDayClick={onDayClick} />,
		}),
		[handleDelete, onDayClick]
	)

	useEffect(() => {
		if (!eventsService) return
		eventsService.set(timeBlocks.map(mapTimeBlockToScheduleX))
	}, [timeBlocks, eventsService])

	useEffect(() => {
		if (isInitialScrollDone.current || timeBlocks.length === 0) return

		const scrollToTime = () => {
			const indicator = document.querySelector('.sx__current-time-indicator')

			if (indicator) {
				indicator.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
				isInitialScrollDone.current = true
			}
		}

		const timeout = setTimeout(() => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					scrollToTime()
				})
			})
		}, 100)

		return () => clearTimeout(timeout)
	}, [timeBlocks])

	return <ScheduleXCalendar customComponents={customComponents} calendarApp={calendar} />
}
