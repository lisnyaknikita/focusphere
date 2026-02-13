import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { CalendarEvent } from '@/shared/types/event'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'

import '@schedule-x/theme-default/dist/index.css'

import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { useEffect, useMemo, useState } from 'react'
import { CalendarView } from '../../../constants/calendar.constants'

interface CalendarInnerProps {
	events: CalendarEvent[]
	view: CalendarView
}

export const CalendarInner = ({ events, view }: CalendarInnerProps) => {
	const { calendar, eventsService, setView, eventModal } = useCalendarApp({ defaultView: view })
	const { handleDelete } = useEventDeletion({ eventsService, eventModal })
	const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)

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
		}),
		[]
	)

	useEffect(() => {
		eventsService.set(events.map(mapEventToScheduleX))
	}, [events, eventsService])

	useEffect(() => {
		setView(view)
	}, [view, setView])

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
}
