import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { CreateEventPayload, EventForm } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { formatDate, formatTime, toJSDate } from '@/shared/utils/temporal-adapter/temporal-adapter'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'

export interface CalendarActions {
	create: (data: CreateEventPayload) => Promise<unknown>
	update: (id: string, data: Partial<Omit<CreateEventPayload, 'userId'>>) => Promise<unknown>
}

const getInitialTimeRange = () => {
	const now = new Date()
	const currentHour = now.getHours()

	const start = `${String(currentHour).padStart(2, '0')}:00`
	const end = `${String((currentHour + 1) % 24).padStart(2, '0')}:00`

	return { start, end }
}

const createISOStringFromForm = (dateString: string, timeString: string): string => {
	if (!dateString || !timeString) {
		throw new Error('Missing date or time')
	}

	const [hours, minutes] = timeString.split(':').map(Number)

	const date = new Date(dateString)
	if (isNaN(date.getTime())) {
		throw new Error('Invalid date: ' + dateString)
	}

	date.setHours(hours, minutes, 0, 0)

	return date.toISOString()
}

export const useEventForm = (onSuccess: () => void, initialEvent?: SXEvent, actions?: CalendarActions) => {
	const [form, setForm] = useState<EventForm>(() => {
		if (initialEvent) {
			const startDate = toJSDate(initialEvent.start)
			const endDate = toJSDate(initialEvent.end)

			return {
				title: initialEvent.title || '',
				description: initialEvent.description as string | undefined,
				date: formatDate(startDate),
				startTime: formatTime(startDate),
				endTime: formatTime(endDate),
				color: (initialEvent.color as string) || '#D79716',
			}
		}

		const { start, end } = getInitialTimeRange()

		return {
			title: '',
			description: undefined,
			date: new Date().toISOString().slice(0, 10),
			startTime: start,
			endTime: end,
			color: '#D79716',
		}
	})

	const setFormField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!actions) return

		const startDateISO = createISOStringFromForm(form.date, form.startTime)
		const endDateISO = createISOStringFromForm(form.date, form.endTime)
		const userId = await getCurrentUserId()

		const eventData: CreateEventPayload = {
			title: form.title,
			description: form.description,
			startDate: startDateISO,
			endDate: endDateISO,
			color: form.color,
			calendarId: getCalendarIdByColor(form.color),
			userId,
		}

		try {
			if (initialEvent?.id) {
				const updateData: Partial<Omit<CreateEventPayload, 'userId'>> = {
					title: eventData.title,
					description: eventData.description,
					startDate: eventData.startDate,
					endDate: eventData.endDate,
					color: eventData.color,
					calendarId: eventData.calendarId,
				}

				await actions.update(String(initialEvent.id), updateData)
			} else {
				await actions.create(eventData)
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
