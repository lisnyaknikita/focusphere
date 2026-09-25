import { addRecurrenceException, createEvent, updateEvent } from '@/lib/events/events'
import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import { isRecurrenceInstanceId, parseRecurrenceInstanceId } from '@/shared/utils/calendar/recurrence'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export const useCalendarMutations = () => {
	const queryClient = useQueryClient()

	const invalidateActiveMonths = useCallback(async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: ['calendar-events-month'],
				type: 'active',
			}),
			queryClient.invalidateQueries({
				queryKey: ['calendar-google-events-month'],
				type: 'active',
			}),
			queryClient.invalidateQueries({
				queryKey: ['calendar-recurring-events'],
			}),
		])
	}, [queryClient])

	const handleUpdateEvent = useCallback(
		async (
			eventId: string,
			data: Partial<Omit<CalendarEvent, 'userId'>>,
			googleEventId?: string,
			scope: 'this' | 'all' = 'this'
		) => {
			const { title, description, color, startDate, endDate, calendarId, recurrenceRule } = data

			const payload: Partial<Omit<CreateEventPayload, 'userId'>> = {
				...(title !== undefined && { title }),
				...(description !== undefined && { description }),
				...(color !== undefined && { color }),
				...(startDate !== undefined && { startDate }),
				...(endDate !== undefined && { endDate }),
				...(calendarId !== undefined && { calendarId }),
				...(recurrenceRule !== undefined && { recurrenceRule }),
			}

			const updateCache = (oldData: unknown) => {
				if (!Array.isArray(oldData)) return oldData
				return oldData.map((event: CalendarEvent) => {
					if (event.$id === eventId || (googleEventId && event.googleEventId === googleEventId)) {
						return {
							...event,
							...payload,
						}
					}
					return event
				})
			}

			queryClient.setQueriesData({ queryKey: ['calendar-events-month'] }, updateCache)
			queryClient.setQueriesData({ queryKey: ['calendar-google-events-month'] }, updateCache)

			try {
				if (isRecurrenceInstanceId(eventId)) {
					const parsed = parseRecurrenceInstanceId(eventId)
					if (parsed) {
						if (scope === 'all') {
							await updateEvent(parsed.masterEventId, payload)
						} else {
							await addRecurrenceException(parsed.masterEventId, parsed.instanceDate)
							const userId = await getCurrentUserId()
							await createEvent({
								title: title || 'Untitled event',
								description,
								startDate: startDate || '',
								endDate: endDate || '',
								color: color || '#D79716',
								calendarId: calendarId || 'default',
								userId,
								source: 'local',
								syncStatus: 'not_synced',
							})
						}
					}
				} else {
					if (eventId.startsWith('g_') || googleEventId) {
						const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
						await googleCalendarService.updateEvent(googleEventId || eventId, {
							summary: title,
							description,
							color,
							...(startDate ? { start: startDate } : {}),
							...(endDate ? { end: endDate } : {}),
						})
					}

					if (!eventId.startsWith('g_')) {
						await updateEvent(eventId, payload)
					}
				}
			} catch (error) {
				console.error('Failed to update event:', error)
			} finally {
				await invalidateActiveMonths()
			}
		},
		[queryClient, invalidateActiveMonths]
	)

	const handleCreateEvent = useCallback(
		async (data: CreateEventPayload) => {
			let googleEventId: string | undefined
			let syncStatus: 'synced' | 'failed' | 'not_synced' = 'not_synced'

			const isRecurring = Boolean(data.recurrenceRule && data.recurrenceRule.trim())

			if (!isRecurring) {
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
			}

			const created = await createEvent({
				...data,
				...(googleEventId && { googleEventId }),
				syncStatus,
			})

			await invalidateActiveMonths()
			return created
		},
		[invalidateActiveMonths]
	)

	return { handleCreateEvent, handleUpdateEvent }
}
