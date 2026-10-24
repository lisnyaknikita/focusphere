import clsx from 'clsx'
import classes from '../../custom-recurrence-modal.module.scss'

export const WEEKDAY_NAMES = [
	{ label: 'Mo', title: 'Monday', index: 0 },
	{ label: 'Tu', title: 'Tuesday', index: 1 },
	{ label: 'We', title: 'Wednesday', index: 2 },
	{ label: 'Th', title: 'Thursday', index: 3 },
	{ label: 'Fr', title: 'Friday', index: 4 },
	{ label: 'Sa', title: 'Saturday', index: 5 },
	{ label: 'Su', title: 'Sunday', index: 6 },
]

interface WeekDaysSelectorProps {
	weekDays: number[]
	onToggleDay: (index: number) => void
}

export const WeekDaysSelector = ({ weekDays, onToggleDay }: WeekDaysSelectorProps) => {
	return (
		<div className={classes.section}>
			<label className={classes.sectionLabel}>Repeat on</label>
			<div className={classes.weekDaysRow}>
				{WEEKDAY_NAMES.map(day => {
					const isSelected = weekDays.includes(day.index)
					return (
						<button
							key={day.index}
							type='button'
							title={day.title}
							className={clsx(classes.dayButton, isSelected && classes.dayButtonActive)}
							onClick={() => onToggleDay(day.index)}
						>
							{day.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
