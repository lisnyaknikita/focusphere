import { getCalendarIdByColor } from '@/lib/events/color-to-calendar'
import { CreateEventPayload, EventForm, RecurrenceConfig } from '@/shared/types/event'
import { configToRRule, rruleToConfig } from '@/shared/utils/calendar/recurrence'
import { extractDateTimeComponents, localDateTimeToInstant } from '@/shared/utils/event-date-time/event-date-time'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { toast } from 'sonner'
import 'temporal-polyfill/global'

export interface CalendarActions {
	create: (data: CreateEventPayload) => Promise<unknown>
	update: (
		id: string,
		data: Partial<Omit<CreateEventPayload, 'userId'>>,
		googleEventId?: string,
		scope?: 'this' | 'all'
	) => Promise<unknown>
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

export const useEventForm = (
	onSuccess: () => void,
	initialEvent?: SXEvent | InitialEventValues,
	actions?: CalendarActions,
	initialTitle?: string,
	updateScope: 'this' | 'all' = 'this'
) => {
	const [form, setForm] = useState<EventForm>(() => {
		if (initialEvent && 'id' in initialEvent) {
			const startParsed = extractDateTimeComponents(initialEvent.start)
			const endParsed = extractDateTimeComponents(initialEvent.end)

			const initialRecurrenceRule = (initialEvent as unknown as { recurrenceRule?: string }).recurrenceRule
			const recurrence: RecurrenceConfig = initialRecurrenceRule
				? rruleToConfig(initialRecurrenceRule)
				: { frequency: 'none', interval: 1, endType: 'never' }

			return {
				title: initialEvent.title || '',
				description: initialEvent.description as string | undefined,
				date: startParsed.date,
				startTime: startParsed.time,
				endTime: endParsed.time,
				color: (initialEvent.color as string) || '#D79716',
				recurrence,
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
			recurrence: { frequency: 'none', interval: 1, endType: 'never' },
		}
	})

	const setFormField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (e?: React.FormEvent, scope: 'this' | 'all' = updateScope) => {
		e?.preventDefault()
		if (!actions) return

		const trimmedTitle = form.title.trim()
		if (!trimmedTitle) {
			toast.error('Title is required')
			return
		}

		const startDateISO = formatDateTimeForAppwrite(form.date, form.startTime)
		const endDateISO = formatDateTimeForAppwrite(form.date, form.endTime)
		const userId = await getCurrentUserId()

		let recurrenceRule: string | undefined
		if (form.recurrence && form.recurrence.frequency !== 'none') {
			recurrenceRule = configToRRule(form.recurrence, startDateISO)
		}

		const eventData: CreateEventPayload = {
			title: trimmedTitle,
			description: form.description,
			startDate: startDateISO,
			endDate: endDateISO,
			color: form.color,
			calendarId: getCalendarIdByColor(form.color),
			userId,
			...(recurrenceRule ? { recurrenceRule } : {}),
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
					recurrenceRule,
				}

				const updatePromise = actions.update(
					String(initialEvent.id),
					updateData,
					initialEvent.googleEventId as string | undefined,
					scope
				)
				toast.promise(updatePromise, {
					loading: 'Updating event...',
					success: 'Event updated',
					error: 'Failed to update event',
				})
				await updatePromise
			} else {
				const createPromise = actions.create(eventData)
				toast.promise(createPromise, {
					loading: 'Creating event...',
					success: recurrenceRule ? 'Recurring event created' : 'Event created',
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
