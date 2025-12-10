import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { createEvent } from '@/lib/events/events'
import { EventForm } from '@/shared/types/event'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useState } from 'react'

const createISOStringFromForm = (dateString: string, timeString: string): string => {
	if (!dateString) {
		console.error('Date error')
		return ''
	}

	const [hours, minutes] = timeString.split(':').map(Number)

	const date = new Date(dateString + 'T00:00:00.000Z')

	if (isNaN(date.getTime())) {
		console.error('Error string:', dateString)
		throw new Error('Incorrect date')
	}

	date.setUTCHours(hours, minutes, 0, 0)

	return date.toISOString()
}

const INITIAL_FORM_STATE: EventForm = {
	title: '',
	description: undefined,
	date: new Date().toISOString().slice(0, 10),
	startTime: '09:00',
	endTime: '10:00',
	color: '#D79716',
}

export const useEventForm = (onSuccess: () => void) => {
	const [form, setForm] = useState<EventForm>(INITIAL_FORM_STATE)

	const setFormField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const startDateISO = createISOStringFromForm(form.date, form.startTime)
		const endDateISO = createISOStringFromForm(form.date, form.endTime)
		const userId = await getCurrentUserId()

		await createEvent({
			title: form.title,
			description: form.description,
			startDate: startDateISO,
			endDate: endDateISO,
			color: form.color,
			calendarId: getCalendarIdByColor(form.color),
			userId,
		})

		onSuccess()
	}

	return {
		form,
		setFormField,
		handleSubmit,
	}
}
