import { createEvent, updateEvent } from '@/lib/events/events'
import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { useCallback } from 'react'

export const useCalendarMutations = () => {
	const handleUpdateEvent = useCallback(async (eventId: string, data: Partial<Omit<CalendarEvent, 'userId'>>) => {
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
		} else {
			await updateEvent(eventId, payload)
		}
	}, [])

	const handleCreateEvent = useCallback(async (data: CreateEventPayload) => {
		const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
		const googleEvent = await googleCalendarService.createEvent({
			summary: data.title,
			description: data.description,
			color: data.color,
			start: data.startDate,
			end: data.endDate,
		})

		if (googleEvent) return googleEvent
		return createEvent(data)
	}, [])

	return { handleCreateEvent, handleUpdateEvent }
}
