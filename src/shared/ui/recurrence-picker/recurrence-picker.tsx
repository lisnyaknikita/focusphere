'use client'

import { useBilling } from '@/shared/context/billing-context'
import { EventForm, RecurrenceConfig, RecurrenceFrequency } from '@/shared/types/event'
import 'temporal-polyfill/global'
import classes from './recurrence-picker.module.scss'

interface RecurrencePickerProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

const getDayOfWeekIndex = (dateStr?: string): number => {
	if (!dateStr) return 0
	try {
		const plainDate = Temporal.PlainDate.from(dateStr)
		return (plainDate.dayOfWeek - 1 + 7) % 7
	} catch {
		return 0
	}
}

const getDayOfWeekName = (dateStr?: string): string => {
	const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const idx = getDayOfWeekIndex(dateStr)
	return dayNames[idx] || 'day'
}

export const RecurrencePicker = ({ form, setFormField }: RecurrencePickerProps) => {
	const { isPro, openPaywall } = useBilling()
	const recurrence = form.recurrence || { frequency: 'none', interval: 1, endType: 'never' }

	const currentDayIndex = getDayOfWeekIndex(form.date)
	const currentDayName = getDayOfWeekName(form.date)

	const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const nextFreq = e.target.value as RecurrenceFrequency

		if (nextFreq !== 'none' && !isPro) {
			openPaywall('planner_recurrence')
			return
		}

		let next: RecurrenceConfig

		switch (nextFreq) {
			case 'none':
				next = { frequency: 'none', interval: 1, endType: 'never' }
				break
			case 'daily':
				next = { frequency: 'daily', interval: 1, endType: 'never' }
				break
			case 'weekdays':
				next = { frequency: 'weekdays', interval: 1, weekDays: [0, 1, 2, 3, 4], endType: 'never' }
				break
			case 'weekly':
				next = { frequency: 'weekly', interval: 1, weekDays: [currentDayIndex], endType: 'never' }
				break
			case 'monthly':
				next = { frequency: 'monthly', interval: 1, endType: 'never' }
				break
			default:
				next = { frequency: 'none', interval: 1, endType: 'never' }
		}

		setFormField('recurrence', next)
	}

	return (
		<div className={classes.recurrenceContainer}>
			<div className={classes.selectRow}>
				<label htmlFor='recurrence-select' className={classes.label}>
					Repeat
					{!isPro && <span className={classes.proBadge}>PRO</span>}
				</label>
				<select
					id='recurrence-select'
					className={classes.select}
					value={recurrence.frequency}
					onChange={handleFrequencyChange}
				>
					<option value='none'>Does not repeat</option>
					<option value='daily'>Every day</option>
					<option value='weekdays'>Every weekday (Mon–Fri)</option>
					<option value='weekly'>Every week on {currentDayName}</option>
					<option value='monthly'>Every month</option>
				</select>
			</div>
		</div>
	)
}
