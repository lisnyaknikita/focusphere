import { addRecurrenceException, createEvent, updateEvent } from '@/lib/events/events'
import { calendarKeys } from '@/shared/constants/query-keys'
import { runCalendarOperation } from '@/shared/stores/calendar-operation.store'
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
			queryClient.invalidateQueries({ queryKey: calendarKeys.all, refetchType: 'active' }),
			queryClient.invalidateQueries({ queryKey: ['events-today-appwrite'], refetchType: 'active' }),
			queryClient.invalidateQueries({ queryKey: ['events-today-google'], refetchType: 'active' }),
		])
	}, [queryClient])

	const handleUpdateEvent = useCallback(
		async (
			eventId: string,
			data: Partial<Omit<CalendarEvent, 'userId'>>,
			googleEventId?: string,
			scope: 'this' | 'all' = 'this'
		) => {
			const parsedInstance = isRecurrenceInstanceId(eventId) ? parseRecurrenceInstanceId(eventId) : null
			const affectedIds = [eventId, ...(parsedInstance ? [parsedInstance.masterEventId] : [])]

			return runCalendarOperation(
				scope === 'all' ? 'Updating recurring series…' : 'Saving event…',
				async () => {
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

					const masterGoogleEventId = parsedInstance
						? googleEventId || getMasterGoogleEventId(queryClient, parsedInstance.masterEventId)
						: googleEventId

					let updatePayload = payload
					let googleStartDate = startDate
					let googleEndDate = endDate

					if (parsedInstance && scope === 'all' && startDate && endDate) {
						const master = getMasterEvent(queryClient, parsedInstance.masterEventId)
						if (master) {
							const adjusted = adjustMasterDatesForSeriesUpdate(master, parsedInstance.instanceDate, startDate, endDate)
							updatePayload = { ...payload, startDate: adjusted.startDate, endDate: adjusted.endDate }
							googleStartDate = adjusted.startDate
							googleEndDate = adjusted.endDate
						}
					}

					await Promise.all([
						queryClient.cancelQueries({ queryKey: calendarKeys.all }),
						queryClient.cancelQueries({ queryKey: ['events-today-appwrite'] }),
						queryClient.cancelQueries({ queryKey: ['events-today-google'] }),
					])

					const previousCalendarData = queryClient.getQueriesData({ queryKey: calendarKeys.all })
					const previousTodayAppData = queryClient.getQueriesData({ queryKey: ['events-today-appwrite'] })
					const previousTodayGoogleData = queryClient.getQueriesData({ queryKey: ['events-today-google'] })

					const updateCache = (oldData: unknown) => {
						if (!Array.isArray(oldData)) return oldData
						return oldData.map((event: CalendarEvent) => {
							const isSeriesMaster = scope === 'all' && parsedInstance && event.$id === parsedInstance.masterEventId
							const isTarget = event.$id === eventId || (googleEventId && event.googleEventId === googleEventId)
							if (isSeriesMaster || isTarget) {
								return { ...event, ...(isSeriesMaster ? updatePayload : payload) }
							}
							return event
						})
					}

					queryClient.setQueriesData({ queryKey: calendarKeys.all }, updateCache)
					queryClient.setQueriesData({ queryKey: ['events-today-appwrite'] }, updateCache)
					queryClient.setQueriesData({ queryKey: ['events-today-google'] }, updateCache)

					try {
						if (parsedInstance) {
							if (scope === 'all') {
								await updateEvent(parsedInstance.masterEventId, updatePayload)

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
								await addRecurrenceException(parsedInstance.masterEventId, parsedInstance.instanceDate)

								if (masterGoogleEventId) {
									const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
									await googleCalendarService.deleteEventInstance(masterGoogleEventId, parsedInstance.instanceDate)
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
						} else {
							if (eventId.startsWith('g_') || masterGoogleEventId) {
								const gId = masterGoogleEventId || eventId
								const { googleCalendarService } = await import('@/shared/services/google-calendar.service')
								if (recurrenceRule) {
									await googleCalendarService.updateRecurringEvent(gId, {
										summary: title,
										description,
										color,
										...(startDate ? { start: startDate } : {}),
										...(endDate ? { end: endDate } : {}),
										recurrenceRule,
									})
								} else {
									await googleCalendarService.updateEvent(gId, {
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
						previousCalendarData.forEach(([key, cachedData]) => queryClient.setQueryData(key, cachedData))
						previousTodayAppData.forEach(([key, cachedData]) => queryClient.setQueryData(key, cachedData))
						previousTodayGoogleData.forEach(([key, cachedData]) => queryClient.setQueryData(key, cachedData))
					} finally {
						await invalidateActiveMonths()
					}
				},
				affectedIds
			)
		},
		[queryClient, invalidateActiveMonths]
	)

	const handleCreateEvent = useCallback(
		async (data: CreateEventPayload) => {
			return runCalendarOperation('Creating event…', async () => {
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

				try {
					const created = await createEvent({
						...data,
						...(googleEventId && { googleEventId }),
						syncStatus,
					})
					return created
				} finally {
					await invalidateActiveMonths()
				}
			})
		},
		[invalidateActiveMonths]
	)

	return { handleCreateEvent, handleUpdateEvent }
}
