import { createEvent, updateEvent } from '@/lib/events/events'
import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { calendarEventsMonthQueryKey, calendarGoogleEventsMonthQueryKey } from '../events/use-calendar-events'

const getAffectedMonthKeys = (startDate: string, endDate?: string): string[] => {
	const keys: string[] = []
	const start = new Date(startDate)
	const end = endDate ? new Date(endDate) : start

	let cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
	const limit = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1))

	while (cur <= limit) {
		const key = `${cur.getUTCFullYear()}-${String(cur.getUTCMonth() + 1).padStart(2, '0')}`
		if (!keys.includes(key)) keys.push(key)
		cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1))
	}
	return keys
}

export const useCalendarMutations = () => {
	const queryClient = useQueryClient()

	const invalidateEventMonths = useCallback(
		async (userId: string, startDate: string, endDate?: string) => {
			const monthKeys = getAffectedMonthKeys(startDate, endDate)
			await Promise.all(
				monthKeys.flatMap(monthKey => [
					queryClient.invalidateQueries({ queryKey: calendarEventsMonthQueryKey(userId, monthKey) }),
					queryClient.invalidateQueries({ queryKey: calendarGoogleEventsMonthQueryKey(userId, monthKey) }),
				])
			)
		},
		[queryClient]
	)

	const handleUpdateEvent = useCallback(
		async (eventId: string, data: Partial<Omit<CalendarEvent, 'userId'>>, googleEventId?: string, userId?: string) => {
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

			if (userId && startDate) {
				await invalidateEventMonths(userId, startDate, endDate)
			}
		},
		[invalidateEventMonths]
	)

	const handleCreateEvent = useCallback(
		async (data: CreateEventPayload) => {
			let googleEventId: string | undefined
			let syncStatus: 'synced' | 'failed' | 'not_synced' = 'not_synced'
			try {
				const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
				const googleEvent = await googleCalendarService.createEvent({
					summary: data.title,
					description: data.description,
					color: data.color,
					start: data.startDate,
					end: data.endDate,
				})
				if (googleEvent?.id) {
					googleEventId = googleEvent.id
					syncStatus = 'synced'
				}
			} catch {
				syncStatus = 'failed'
			}

			const created = await createEvent({
				...data,
				...(googleEventId && { googleEventId }),
				syncStatus,
			})

			await invalidateEventMonths(data.userId, data.startDate, data.endDate)
			return created
		},
		[invalidateEventMonths]
	)

	return { handleCreateEvent, handleUpdateEvent }
}
