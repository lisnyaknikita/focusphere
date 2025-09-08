import classes from './day.module.scss'

const hours = Array.from({ length: 24 }, (_, i) => i)

export const DayView = () => {
	return (
		<>
			<div className={classes.dayView}>
				<div style={{ width: 46 }}></div>
				<div className={classes.dayColumn}>
					<span className={classes.dayName}>Wed</span>
					<span className={classes.dayNumber}>3</span>
				</div>
				<div></div>
			</div>
			<div className={classes.scrollArea}>
				<div className={classes.scrollGrid}>
					<div className={classes.hours}>
						{hours.map((hour, i) => {
							return (
								<div key={i} className={classes.hourColumn}>
									{String(hour).padStart(2, '0')}:00
								</div>
							)
						})}
					</div>
					<div className={classes.dayBoxColumn}>
						{hours.map(hour => {
							return <div key={hour} className={classes.hourBox}></div>
						})}
					</div>
				</div>
			</div>
		</>
	)
}
