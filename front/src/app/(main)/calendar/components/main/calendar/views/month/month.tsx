import classes from './month.module.scss'

const days = Array.from({ length: 35 }, (_, i) => i + 1)

export const MonthView = () => {
	return (
		<div className={classes.monthGrid}>
			{days.map(day => (
				<div key={day} className={classes.dayCell}>
					<span className={classes.dayNumber}>{day}</span>
				</div>
			))}
		</div>
	)
}
