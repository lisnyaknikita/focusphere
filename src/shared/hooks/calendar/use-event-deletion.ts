import { addRecurrenceException, deleteEvent } from '@/lib/events/events'
import { calendarKeys } from '@/shared/constants/query-keys'
import { runCalendarOperation } from '@/shared/stores/calendar-operation.store'
import { CalendarEvent } from '@/shared/types/event'
import {
	getMasterGoogleEventId,
	isRecurrenceInstanceId,
	parseRecurrenceInstanceId,
} from '@/shared/utils/calendar/recurrence'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCalendarApp } from './use-calendar-app'

type UseCalendarAppResult = ReturnType<typeof useCalendarApp>

interface IdentifiableEvent {
	$id?: string
	id?: string | number
	googleEventId?: string
}

interface DeletionDependencies {
	eventsService: UseCalendarAppResult['eventsService']
	eventModal: UseCalendarAppResult['eventModal']
}

export const useEventDeletion = ({ eventsService, eventModal }: DeletionDependencies) => {
	const queryClient = useQueryClient()

	const handleDelete = useCallback(
		async (id: string, googleEventId?: string, scope: 'this' | 'all' = 'this') => {
			const isRecur = isRecurrenceInstanceId(id)
			const parsed = isRecur ? parseRecurrenceInstanceId(id) : null
			const affectedIds = [id, ...(parsed ? [parsed.masterEventId] : [])]

			return runCalendarOperation(
				scope === 'all' ? 'Deleting recurring series…' : 'Deleting event…',
				async () => {
					await Promise.all([
						queryClient.cancelQueries({ queryKey: calendarKeys.all }),
						queryClient.cancelQueries({ queryKey: ['events-today-appwrite'] }),
						queryClient.cancelQueries({ queryKey: ['events-today-google'] }),
					])

					const previousCalendarData = queryClient.getQueriesData({ queryKey: calendarKeys.all })
					const previousTodayAppData = queryClient.getQueriesData({ queryKey: ['events-today-appwrite'] })
					const previousTodayGoogleData = queryClient.getQueriesData({ queryKey: ['events-today-google'] })

					eventsService.remove(id)
					eventModal.close()

					const filterOutEvent = <T extends IdentifiableEvent>(oldData: T[] | undefined): T[] | undefined => {
						if (!oldData) return oldData
						return oldData.filter(item => {
							if (isRecur && scope === 'all' && parsed) {
								return item.$id !== parsed.masterEventId && String(item.id) !== parsed.masterEventId
							}
							return item.$id !== id && String(item.id) !== id && item.googleEventId !== googleEventId
						})
					}

					if (isRecur && scope === 'this' && parsed) {
						const patchMaster = (oldData: unknown) => {
							if (!Array.isArray(oldData)) return oldData
							return (oldData as CalendarEvent[]).map(event => {
								if (event.$id !== parsed.masterEventId) return event
								const existingExDates = event.recurrenceExDates || []
								if (existingExDates.includes(parsed.instanceDate)) return event
								return {
									...event,
									recurrenceExDates: [...existingExDates, parsed.instanceDate],
								}
							})
						}
						queryClient.setQueriesData({ queryKey: [...calendarKeys.all, 'recurring'] }, patchMaster)
						queryClient.setQueriesData({ queryKey: calendarKeys.localMonths() }, patchMaster)
					} else {
						queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: calendarKeys.localMonths() }, filterOutEvent)
						queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: calendarKeys.googleMonths() }, filterOutEvent)
						queryClient.setQueriesData<IdentifiableEvent[]>(
							{ queryKey: [...calendarKeys.all, 'recurring'] },
							filterOutEvent
						)
						queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['events-today-appwrite'] }, filterOutEvent)
						queryClient.setQueriesData<IdentifiableEvent[]>({ queryKey: ['events-today-google'] }, filterOutEvent)
					}

					const deletePromise = (async () => {
						if (isRecur && parsed) {
							const masterGoogleEventId = googleEventId || getMasterGoogleEventId(queryClient, parsed.masterEventId)

							if (scope === 'all') {
								if (masterGoogleEventId) {
									await import('@/shared/services/google-calendar.service').then(m =>
										m.googleCalendarService.deleteEvent(masterGoogleEventId)
									)
								}
								await deleteEvent(parsed.masterEventId)
							} else {
								if (masterGoogleEventId) {
									await import('@/shared/services/google-calendar.service').then(m =>
										m.googleCalendarService.deleteEventInstance(masterGoogleEventId, parsed.instanceDate)
									)
								}
								await addRecurrenceException(parsed.masterEventId, parsed.instanceDate)
							}
							return
						}

						if (id.startsWith('g_')) {
							return import('@/shared/services/google-calendar.service').then(m =>
								m.googleCalendarService.deleteEvent(id)
							)
						}
						if (googleEventId) {
							await import('@/shared/services/google-calendar.service').then(m =>
								m.googleCalendarService.deleteEvent(googleEventId)
							)
						}
						await deleteEvent(id)
					})()

					toast.promise(deletePromise, {
						loading: 'Deleting event...',
						success: 'Event deleted',
						error: 'Failed to delete event',
					})

					const invalidateAll = async () => {
						await Promise.all([
							queryClient.invalidateQueries({ queryKey: calendarKeys.all, refetchType: 'active' }),
							queryClient.invalidateQueries({ queryKey: ['events-today-appwrite'], refetchType: 'active' }),
							queryClient.invalidateQueries({ queryKey: ['events-today-google'], refetchType: 'active' }),
						])
					}

					try {
						await deletePromise
					} catch (error) {
						console.error('Error deleting event, rolling back:', error)
						previousCalendarData.forEach(([key, cachedData]) => queryClient.setQueryData(key, cachedData))
						previousTodayAppData.forEach(([key, cachedData]) => queryClient.setQueryData(key, cachedData))
						previousTodayGoogleData.forEach(([key, cachedData]) => queryClient.setQueryData(key, cachedData))
					} finally {
						await invalidateAll()
					}
				},
				affectedIds
			)
		},
		[eventsService, eventModal, queryClient]
	)

	return { handleDelete }
}
