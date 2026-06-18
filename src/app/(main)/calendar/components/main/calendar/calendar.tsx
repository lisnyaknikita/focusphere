import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { CalendarEvent } from '@/shared/types/event'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'

import '@schedule-x/theme-default/dist/index.css'

import { WeekDayHeader } from '@/app/(main)/planner/components/main/planner-inner/components/week-day-header/week-day-header'
import { useCalendarMutations } from '@/shared/hooks/calendar/use-calnedar-mutations'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
import { useCalendarScroll } from '@/shared/hooks/planner/use-calendar-scroll'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { memo, useEffect, useMemo, useState } from 'react'
import { CalendarView } from '../../../constants/calendar.constants'

interface CalendarInnerProps {
	events: CalendarEvent[]
	view: CalendarView
	getEvents: () => void
}

export const CalendarInner = memo(({ events, view, getEvents }: CalendarInnerProps) => {
	const { calendar, eventsService, setView, eventModal } = useCalendarApp({ defaultView: view })
	const { handleDelete } = useEventDeletion({ eventsService, eventModal })
	const { handleCreateEvent, handleUpdateEvent } = useCalendarMutations()

	const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)

	useCalendarScroll({ dependencies: [view] })

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
					onConfirmDelete={() => setEventToDelete(calendarEvent)}
					onUpdated={() => {
						getEvents()
						eventModal.close()
					}}
					actions={{
						create: handleCreateEvent,
						update: handleUpdateEvent,
					}}
				/>
			),
			weekGridDate: ({ date }: { date: string }) => <WeekDayHeader date={date} />,
		}),
		[getEvents, handleCreateEvent, handleUpdateEvent]
	)

	useEffect(() => {
		eventsService.set(events.map(mapEventToScheduleX))
	}, [events, eventsService])

	useEffect(() => {
		setView(view)
	}, [view, setView])

	return (
		<>
			<ScheduleXCalendar customComponents={customComponents} calendarApp={calendar} />
			<ConfirmModal
				isVisible={!!eventToDelete}
				onClose={() => setEventToDelete(null)}
				onConfirm={handleConfirmDelete}
				title='Delete Event'
				message={
					<>
						Are you sure you want to delete &quot;<span className='highlight'>{eventToDelete?.title}</span>&quot;?
					</>
				}
			/>
		</>
	)
})

CalendarInner.displayName = 'CalendarInner'
