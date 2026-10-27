import { addRecurrenceException, createEvent, updateEvent } from '@/lib/events/events'
import { calendarKeys } from '@/shared/constants/query-keys'
import { CalendarEvent, CreateEventPayload } from '@/shared/types/event'
import {
	adjustMasterDatesForSeriesUpdate,
	getMasterEvent,
	getMasterGoogleEventId,
	isRecurrenceInstanceId,
	parseRecurrenceInstanceId,
} from '@/shared/utils/calendar/recurrence'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

const DEFAULT_EVENT_COLOR = '#D79716'

export const useCalendarMutations = () => {
	const queryClient = useQueryClient()

	const invalidateActiveMonths = useCallback(async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: calendarKeys.localMonths(), type: 'active' }),
			queryClient.invalidateQueries({ queryKey: calendarKeys.googleMonths(), type: 'active' }),
			queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
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

			const previousLocalData = queryClient.getQueriesData({ queryKey: calendarKeys.localMonths() })
			const previousGoogleData = queryClient.getQueriesData({ queryKey: calendarKeys.googleMonths() })

			const updateCache = (oldData: unknown) => {
				if (!Array.isArray(oldData)) return oldData
				return oldData.map((event: CalendarEvent) => {
					if (event.$id === eventId || (googleEventId && event.googleEventId === googleEventId)) {
						return { ...event, ...payload }
					}
					return event
				})
			}

			queryClient.setQueriesData({ queryKey: calendarKeys.localMonths() }, updateCache)
			queryClient.setQueriesData({ queryKey: calendarKeys.googleMonths() }, updateCache)

			try {
				if (isRecurrenceInstanceId(eventId)) {
					const parsed = parseRecurrenceInstanceId(eventId)
					if (parsed) {
						const masterGoogleEventId = googleEventId || getMasterGoogleEventId(queryClient, parsed.masterEventId)

						if (scope === 'all') {
							let updatePayload = payload
							let googleStartDate = startDate
							let googleEndDate = endDate

							if (startDate && endDate) {
								const master = getMasterEvent(queryClient, parsed.masterEventId)
								if (master) {
									const adjusted = adjustMasterDatesForSeriesUpdate(master, parsed.instanceDate, startDate, endDate)
									updatePayload = {
										...payload,
										startDate: adjusted.startDate,
										endDate: adjusted.endDate,
									}
									googleStartDate = adjusted.startDate
									googleEndDate = adjusted.endDate
								}
							}

							await updateEvent(parsed.masterEventId, updatePayload)

							if (masterGoogleEventId) {
								const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
								await googleCalendarService.updateRecurringEvent(masterGoogleEventId, {
									summary: title,
									description,
									color,
									...(googleStartDate ? { start: googleStartDate } : {}),
									...(googleEndDate ? { end: googleEndDate } : {}),
									...(recurrenceRule ? { recurrenceRule } : {}),
								})
							}
						} else {
							await addRecurrenceException(parsed.masterEventId, parsed.instanceDate)

							if (masterGoogleEventId) {
								const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
								await googleCalendarService.deleteEventInstance(masterGoogleEventId, parsed.instanceDate)
							}

							let newGoogleEventId: string | undefined
							let syncStatus: 'synced' | 'failed' | 'not_synced' = 'not_synced'

							try {
								const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
								const googleEvent = await googleCalendarService.createEvent({
									summary: title || 'Untitled event',
									description,
									color: color || DEFAULT_EVENT_COLOR,
									start: startDate || '',
									end: endDate || '',
								})
								if (googleEvent?.id) {
									newGoogleEventId = googleEvent.id
									syncStatus = 'synced'
								}
							} catch {
								syncStatus = 'failed'
							}

							const userId = await getCurrentUserId()
							await createEvent({
								title: title || 'Untitled event',
								description,
								startDate: startDate || '',
								endDate: endDate || '',
								color: color || DEFAULT_EVENT_COLOR,
								calendarId: calendarId || 'default',
								userId,
								source: 'local',
								...(newGoogleEventId && { googleEventId: newGoogleEventId }),
								syncStatus,
							})
						}
					}
				} else {
					if (eventId.startsWith('g_') || googleEventId) {
						const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
						if (recurrenceRule) {
							await googleCalendarService.updateRecurringEvent(googleEventId || eventId, {
								summary: title,
								description,
								color,
								...(startDate ? { start: startDate } : {}),
								...(endDate ? { end: endDate } : {}),
								recurrenceRule,
							})
						} else {
							await googleCalendarService.updateEvent(googleEventId || eventId, {
								summary: title,
								description,
								color,
								...(startDate ? { start: startDate } : {}),
								...(endDate ? { end: endDate } : {}),
							})
						}
					}

					if (!eventId.startsWith('g_')) {
						await updateEvent(eventId, payload)
					}
				}
			} catch (error) {
				console.error('Failed to update event, rolling back:', error)
				previousLocalData.forEach(([key, data]) => queryClient.setQueryData(key, data))
				previousGoogleData.forEach(([key, data]) => queryClient.setQueryData(key, data))
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

			try {
				const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
				if (isRecurring) {
					const googleEvent = await googleCalendarService.createRecurringEvent({
						summary: data.title,
						description: data.description,
						color: data.color,
						start: data.startDate,
						end: data.endDate,
						recurrenceRule: data.recurrenceRule!,
					})
					if (googleEvent?.id) {
						googleEventId = googleEvent.id
						syncStatus = 'synced'
					}
				} else {
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
				}
			} catch {
				syncStatus = 'failed'
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
