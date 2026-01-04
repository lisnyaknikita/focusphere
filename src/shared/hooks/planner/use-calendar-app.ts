import { CALENDARS_CONFIG } from '@/lib/events/calendar-config'
import { updateTimeBlock } from '@/lib/planner/planner'
import { CalendarEvent, createViewWeek } from '@schedule-x/calendar'
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { useNextCalendarApp } from '@schedule-x/react'
import { useState } from 'react'

export const useCalendarApp = () => {
	const [eventsService] = useState(() => createEventsServicePlugin())
	const [calendarControls] = useState(() => createCalendarControlsPlugin())
	const [eventModal] = useState(() => createEventModalPlugin())
	const [dragAndDropPlugin] = useState(() => createDragAndDropPlugin())

	const calendar = useNextCalendarApp({
		views: [createViewWeek()],
		defaultView: 'week',
		events: [],
		plugins: [eventsService, calendarControls, createCurrentTimePlugin(), dragAndDropPlugin, eventModal],
		callbacks: {
			async onEventUpdate(updatedEvent: CalendarEvent) {
				try {
					const { id, start, end } = updatedEvent

					const formatForAppwrite = (dateObj: string | { toString(): string }): string => {
						const base = dateObj.toString().replace('T', ' ').substring(0, 16)
						return `${base}:00`
					}

					const startDate = formatForAppwrite(start)
					const endDate = formatForAppwrite(end)

					console.log('Sending to Appwrite:', { startDate, endDate })

					await updateTimeBlock(id as string, {
						startDate,
						endDate,
					})
				} catch (error) {
					console.error('Appwrite update failed:', error)
				}
			},
		},
		calendars: CALENDARS_CONFIG,
		//@ts-expect-error timezone type ignored
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	})

	return { calendar, eventsService, eventModal }
}
