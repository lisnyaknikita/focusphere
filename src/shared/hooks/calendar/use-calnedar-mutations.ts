import { createEvent, updateEvent } from '@/lib/events/events'
import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export const useCalendarMutations = () => {
	const queryClient = useQueryClient()

	const invalidateCalendarQueries = useCallback(async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ['calendar-events-month'] }),
			queryClient.invalidateQueries({ queryKey: ['calendar-google-events-month'] }),
			queryClient.invalidateQueries({ queryKey: ['calendar-events'] }),
			queryClient.invalidateQueries({ queryKey: ['calendar-google-events'] }),
			queryClient.invalidateQueries({ queryKey: ['events-today-appwrite'] }),
			queryClient.invalidateQueries({ queryKey: ['events-today-google'] }),
		])
	}, [queryClient])

	const handleUpdateEvent = useCallback(
		async (eventId: string, data: Partial<Omit<CalendarEvent, 'userId'>>, googleEventId?: string) => {
			const { title, description, color, startDate, endDate, calendarId } = data
			const cleanTitle = title
			const payload: Partial<Omit<CreateEventPayload, 'userId'>> = {
				...(cleanTitle !== undefined && { title: cleanTitle }),
				...(description !== undefined && { description }),
				...(color !== undefined && { color }),
				...(startDate !== undefined && { startDate }),
				...(endDate !== undefined && { endDate }),
				...(calendarId !== undefined && { calendarId }),
			}

			if (eventId.startsWith('g_') || googleEventId) {
				const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
				await googleCalendarService.updateEvent(googleEventId || eventId, {
					summary: cleanTitle,
					description,
					color,
					start: startDate ?? new Date().toISOString(),
					end: endDate ?? new Date().toISOString(),
				})
			}
			if (!eventId.startsWith('g_')) await updateEvent(eventId, payload)

			await invalidateCalendarQueries()
		},
		[invalidateCalendarQueries]
	)

	const handleCreateEvent = useCallback(
		async (data: CreateEventPayload) => {
			const created = await createEvent(data)
			try {
				const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
				const googleEvent = await googleCalendarService.createEvent({
					summary: data.title,
					description: data.description,
					color: data.color,
					start: data.startDate,
					end: data.endDate,
				})
				if (googleEvent?.id) await updateEvent(created.$id, { googleEventId: googleEvent.id, syncStatus: 'synced' })
			} catch {
				await updateEvent(created.$id, { syncStatus: 'failed' })
			}

			await invalidateCalendarQueries()
			return created
		},
		[invalidateCalendarQueries]
	)

	return { handleCreateEvent, handleUpdateEvent }
}
