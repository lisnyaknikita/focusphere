import { TimeBlockForm } from '@/shared/types/time-block'
import classes from './reccurence-picker.module.scss'

interface RecurrencePickerProps {
	form: TimeBlockForm
	setFormField: <K extends keyof TimeBlockForm>(key: K, value: TimeBlockForm[K]) => void
	disabledDay?: number | string
}

const DAYS = [
	{ label: 'Monday', short: 'Mo', value: 1 },
	{ label: 'Tuesday', short: 'Tu', value: 2 },
	{ label: 'Wednesday', short: 'We', value: 3 },
	{ label: 'Thursday', short: 'Th', value: 4 },
	{ label: 'Friday', short: 'Fr', value: 5 },
	{ label: 'Saturday', short: 'Sa', value: 6 },
	{ label: 'Sunday', short: 'Su', value: 7 },
]

export const RecurrencePicker = ({ form, setFormField, disabledDay }: RecurrencePickerProps) => {
	const getTargetDisabledDay = (): number | undefined => {
		if (disabledDay !== undefined && disabledDay !== null) {
			return Number(disabledDay)
		}
		if ('date' in form && form.date) {
			return new Date(form.date + 'T00:00:00').getDay()
		}
		return undefined
	}

	const targetDisabledDay = getTargetDisabledDay()

	const toggleDay = (dayValue: number) => {
		if (dayValue === targetDisabledDay) return

		const currentDays = form.repeatDays || []

		const newDays = currentDays.includes(dayValue)
			? currentDays.filter(day => day !== dayValue)
			: [...currentDays, dayValue]

		setFormField('repeatDays', newDays)
	}

	const selectEveryDay = () => {
		const allDays = [1, 2, 3, 4, 5, 6, 7]

		const filteredDays = targetDisabledDay !== undefined ? allDays.filter(day => day !== targetDisabledDay) : allDays

		setFormField('repeatDays', filteredDays)
	}

	return (
		<div className={classes.recurrenceWrapper}>
			<div className={classes.header}>
				<span className={classes.label}>Repeat on this week:</span>
				<button type='button' onClick={selectEveryDay} className={classes.everyDayBtn}>
					Every day
				</button>
			</div>
			<div className={classes.daysRow}>
				{DAYS.map(day => {
					const isBaseDay = targetDisabledDay !== undefined && day.value === targetDisabledDay
					const isSelected = form.repeatDays?.includes(day.value) || isBaseDay
					const isDisabled = day.value === disabledDay

					return (
						<button
							key={day.value}
							type='button'
							onClick={() => !isDisabled && toggleDay(day.value)}
							disabled={isDisabled}
							className={`${classes.dayCircle} ${isSelected ? classes.active : ''}`}
							style={{ opacity: `${isDisabled && '0.5'}` }}
						>
							{day.short}
						</button>
					)
				})}
			</div>
		</div>
	)
}
