import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { CreateEventPayload, EventForm } from '@/shared/types/event'
import { localDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { toast } from 'sonner'
import 'temporal-polyfill/global'

export interface CalendarActions {
	create: (data: CreateEventPayload) => Promise<unknown>
	update: (id: string, data: Partial<Omit<CreateEventPayload, 'userId'>>, googleEventId?: string) => Promise<unknown>
}

export interface InitialEventValues {
	date?: string
	startTime?: string
	endTime?: string
}

const getInitialTimeRange = () => {
	const now = new Date()
	const currentHour = now.getHours()

	const start = `${String(currentHour).padStart(2, '0')}:00`
	const end = `${String((currentHour + 1) % 24).padStart(2, '0')}:00`

	return { start, end }
}

const formatDateTimeForAppwrite = (dateString: string, timeString: string): string => {
	if (!dateString || !timeString) {
		throw new Error('Missing date or time')
	}
	return localDateTimeToInstant(dateString, timeString)
}

const getDateForDayOfWeek = (baseDateString: string, targetDay: number): string => {
	const plainDate = Temporal.PlainDate.from(baseDateString)
	const currentDay = plainDate.dayOfWeek
	return plainDate.add({ days: targetDay - currentDay }).toString()
}

export const useEventForm = (
	onSuccess: () => void,
	initialEvent?: SXEvent | InitialEventValues,
	actions?: CalendarActions,
	initialTitle?: string
) => {
	const [form, setForm] = useState<EventForm>(() => {
		if (initialEvent && 'id' in initialEvent) {
			const startStr = initialEvent.start.toString()
			const endStr = initialEvent.end.toString()
			const date = startStr.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || Temporal.Now.plainDateISO().toString()
			const startTime = startStr.match(/(\d{2}:\d{2})/)?.[1] || '09:00'
			const endTime = endStr.match(/(\d{2}:\d{2})/)?.[1] || '10:00'

			return {
				title: initialEvent.title || '',
				description: initialEvent.description as string | undefined,
				date,
				startTime,
				endTime,
				color: (initialEvent.color as string) || '#D79716',
				repeatDays: [],
			}
		}

		const { start, end } = getInitialTimeRange()

		return {
			title: initialTitle || '',
			description: undefined,
			date: initialEvent?.date || Temporal.Now.plainDateISO().toString(),
			startTime: initialEvent?.startTime || start,
			endTime: initialEvent?.endTime || end,
			color: '#D79716',
			repeatDays: [],
		}
	})

	const setFormField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!actions) return

		const trimmedTitle = form.title.trim()
		if (!trimmedTitle) {
			toast.error('Title is required')
			return
		}

		const startDateISO = formatDateTimeForAppwrite(form.date, form.startTime)
		const endDateISO = formatDateTimeForAppwrite(form.date, form.endTime)
		const userId = await getCurrentUserId()

		const eventData: CreateEventPayload = {
			title: trimmedTitle,
			description: form.description,
			startDate: startDateISO,
			endDate: endDateISO,
			color: form.color,
			calendarId: getCalendarIdByColor(form.color),
			userId,
		}

		try {
			if (initialEvent && 'id' in initialEvent && initialEvent.id) {
				const updateData: Partial<Omit<CreateEventPayload, 'userId'>> = {
					title: eventData.title,
					description: eventData.description,
					startDate: eventData.startDate,
					endDate: eventData.endDate,
					color: eventData.color,
					calendarId: eventData.calendarId,
				}

				const updatePromise = actions.update(
					String(initialEvent.id),
					updateData,
					initialEvent.googleEventId as string | undefined
				)
				toast.promise(updatePromise, {
					loading: 'Updating event...',
					success: 'Event updated',
					error: 'Failed to update event',
				})
				await updatePromise
			} else {
				const currentDay = Temporal.PlainDate.from(form.date).dayOfWeek
				const days = [currentDay, ...(form.repeatDays || [])]
				const uniqueDays = [...new Set(days)]

				const createPromise = Promise.all(
					uniqueDays.map(day => {
						const date = getDateForDayOfWeek(form.date, day)
						return actions.create({
							...eventData,
							startDate: formatDateTimeForAppwrite(date, form.startTime),
							endDate: formatDateTimeForAppwrite(date, form.endTime),
						})
					})
				)
				toast.promise(createPromise, {
					loading: 'Creating event...',
					success: form.repeatDays?.length ? 'Event copies created' : 'Event created',
					error: 'Failed to create event',
				})
				await createPromise
			}
			onSuccess()
		} catch (error) {
			console.error('Save failed:', error)
		}
	}

	return {
		form,
		setFormField,
		handleSubmit,
	}
}
