import classes from './week.module.scss'

const hours = Array.from({ length: 24 }, (_, i) => i)
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const WeekView = () => {
	return (
		<>
			<div className={classes.weekView}>
				<div style={{ width: 46 }}></div>
				{days.map((day, i) => {
					return (
						<div key={day} className={classes.dayColumn}>
							<span className={classes.dayName}>{day}</span>
							<span className={classes.dayNumber}>{i + 1}</span>
						</div>
					)
				})}
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
					{days.map(day => {
						return (
							<div key={day} className={classes.dayBoxColumn}>
								{hours.map(hour => {
									return <div key={hour} className={classes.hourBox}></div>
								})}
							</div>
						)
					})}
				</div>
			</div>
		</>
	)
}
