import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useCalendarApp } from '@/shared/hooks/calendar/use-calendar-app'
import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { ScheduleXCalendar } from '@schedule-x/react'

import '@schedule-x/theme-default/dist/index.css'

import { WeekDayHeader } from '@/app/(main)/planner/components/main/planner-inner/components/week-day-header/week-day-header'
import { createEvent, updateEvent } from '@/lib/events/events'
import { useEventDeletion } from '@/shared/hooks/calendar/use-event-deletion'
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
	const [eventToDelete, setEventToDelete] = useState<SXEvent | null>(null)

	const handleConfirmDelete = async () => {
		if (eventToDelete) {
			await handleDelete(String(eventToDelete.id))
			setEventToDelete(null)
		}
	}

	const handleUpdateEvent = async (eventId: string, data: Partial<Omit<CalendarEvent, 'userId'>>) => {
		const { title, description, color, startDate, endDate, calendarId } = data
		const payload: Partial<Omit<CreateEventPayload, 'userId'>> = {
			...(title !== undefined && { title }),
			...(description !== undefined && { description }),
			...(color !== undefined && { color }),
			...(startDate !== undefined && { startDate }),
			...(endDate !== undefined && { endDate }),
			...(calendarId !== undefined && { calendarId }),
		}

		if (eventId.startsWith('g_')) {
			const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
			await googleCalendarService.updateEvent(eventId, {
				summary: title,
				description,
				color,
				start: startDate ?? new Date().toISOString(),
				end: endDate ?? new Date().toISOString(),
			})
			return
		} else {
			return updateEvent(eventId, payload)
		}
	}

	const handleCreateEvent = async (data: CreateEventPayload) => {
		const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
		const googleEvent = await googleCalendarService.createEvent({
			summary: data.title,
			description: data.description,
			color: data.color,
			start: data.startDate,
			end: data.endDate,
		})

		if (googleEvent) {
			return googleEvent
		}

		return createEvent(data)
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
		[getEvents]
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
})

CalendarInner.displayName = 'CalendarInner'
