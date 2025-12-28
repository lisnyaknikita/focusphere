import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { createTimeBlock } from '@/lib/planner/planner'
import { TimeBlockForm } from '@/shared/types/time-block'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useState } from 'react'

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

const INITIAL_FORM_STATE: TimeBlockForm = {
	title: '',
	date: new Date().toISOString().slice(0, 10),
	startTime: '09:00',
	endTime: '10:00',
	color: '#D79716',
}

export const useTimeBlockForm = (onSuccess: () => void) => {
	const [form, setForm] = useState<TimeBlockForm>(INITIAL_FORM_STATE)

	const setFormField = <K extends keyof TimeBlockForm>(key: K, value: TimeBlockForm[K]) => {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const startDateISO = createISOStringFromForm(form.date, form.startTime)
		const endDateISO = createISOStringFromForm(form.date, form.endTime)
		const userId = await getCurrentUserId()

		await createTimeBlock({
			title: form.title,
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
