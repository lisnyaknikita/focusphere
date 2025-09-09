import clsx from 'clsx'
import classes from './week.module.scss'

const hours = Array.from({ length: 24 }, (_, i) => i)
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface WeekViewProps {
	isInPlanner: boolean
	setIsDailyTasksModalVisible?: (status: boolean) => void
}

export const WeekView = ({ isInPlanner, setIsDailyTasksModalVisible }: WeekViewProps) => {
	return (
		<>
			<div className={classes.weekView}>
				<div style={{ width: 46 }}></div>
				{days.map((day, i) => {
					const content = (
						<>
							<span className={classes.dayName}>{day}</span>
							<span className={classes.dayNumber}>{i + 1}</span>
						</>
					)
					return isInPlanner ? (
						<button
							key={day}
							className={clsx(classes.dayColumn, 'button')}
							onClick={() => setIsDailyTasksModalVisible?.(true)}
						>
							{content}
						</button>
					) : (
						<div key={day} className={classes.dayColumn}>
							{content}
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
