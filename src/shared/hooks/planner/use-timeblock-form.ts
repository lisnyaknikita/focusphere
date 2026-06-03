import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { createTimeBlock, updateTimeBlock } from '@/lib/planner/planner'
import { TimeBlockForm } from '@/shared/types/time-block'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { formatDate, formatTime, toJSDate } from '@/shared/utils/temporal-adapter/temporal-adapter'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { toast } from 'sonner'

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

export const getDateForDayOfWeek = (baseDateString: string, targetDayIndex: number): string => {
	const parts = baseDateString.split('-').map(Number)
	const baseDate = new Date(parts[0], parts[1] - 1, parts[2])

	const rawDay = baseDate.getDay()
	const currentDayIndex = rawDay === 0 ? 7 : rawDay

	const diff = targetDayIndex - currentDayIndex

	const targetDate = new Date(baseDate)
	targetDate.setDate(baseDate.getDate() + diff)

	const yyyy = targetDate.getFullYear()
	const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
	const dd = String(targetDate.getDate()).padStart(2, '0')

	return `${yyyy}-${mm}-${dd}`
}

export const useTimeBlockForm = (onSuccess: () => void, initialEvent?: SXEvent) => {
	const [form, setForm] = useState<TimeBlockForm>(() => {
		if (initialEvent) {
			const startDate = toJSDate(initialEvent.start)
			const endDate = toJSDate(initialEvent.end)

			return {
				title: initialEvent.title || '',
				date: formatDate(startDate),
				startTime: formatTime(startDate),
				endTime: formatTime(endDate),
				color: (initialEvent.color as string) || '#D79716',
				repeatDays: [],
			}
		}

		const { start, end } = getInitialTimeRange()

		return {
			title: '',
			date: new Date().toISOString().slice(0, 10),
			startTime: start,
			endTime: end,
			color: '#D79716',
			repeatDays: [],
		}
	})

	const setFormField = <K extends keyof TimeBlockForm>(key: K, value: TimeBlockForm[K]) => {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const userId = await getCurrentUserId()
		const isRepeating = form.repeatDays && form.repeatDays.length > 0

		if (!form.title || !form.title.trim()) {
			toast.error('Title cannot be empty')
			return
		}

		try {
			if (initialEvent?.id && !isRepeating) {
				const startDateISO = createISOStringFromForm(form.date, form.startTime)
				const endDateISO = createISOStringFromForm(form.date, form.endTime)

				const updatePromise = updateTimeBlock(String(initialEvent.id), {
					title: form.title.trim(),
					startDate: startDateISO,
					endDate: endDateISO,
					color: form.color,
					calendarId: getCalendarIdByColor(form.color),
				})
				await updatePromise
			} else {
				const originalDayIndex = new Date(form.date + 'T00:00:00').getDay()

				const daysToCreate = isRepeating ? [originalDayIndex, ...form.repeatDays!] : [originalDayIndex]

				const createPromises = daysToCreate.map(dayIndex => {
					const targetDateString = getDateForDayOfWeek(form.date, dayIndex)

					const startDateISO = createISOStringFromForm(targetDateString, form.startTime)
					const endDateISO = createISOStringFromForm(targetDateString, form.endTime)

					return createTimeBlock({
						title: form.title.trim(),
						startDate: startDateISO,
						endDate: endDateISO,
						color: form.color,
						calendarId: getCalendarIdByColor(form.color),
						userId,
					})
				})

				const promiseExecution = Promise.all(createPromises)

				toast.promise(promiseExecution, {
					loading: isRepeating ? 'Creating repeating blocks...' : 'Creating time block...',
					success: isRepeating ? 'Repeating blocks created' : 'Time block created',
					error: 'Failed to create time block(s)',
				})

				await promiseExecution
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
