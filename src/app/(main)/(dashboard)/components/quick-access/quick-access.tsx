'use client'

import { useRouter } from 'next/navigation'
import classes from './quick-access.module.scss'

export const QuickAccess = () => {
	const router = useRouter()

	return (
		<footer>
			<div className={classes.buttons}>
				<button className={classes.button} onClick={() => router.push('?modal=create-event')}>
					Create Event
				</button>
				<button className={classes.button} onClick={() => router.push('?modal=create-daily-task')}>
					Add Task for Today
				</button>
				<button className={classes.button}>Start Focus Session</button>
			</div>
		</footer>
	)
}
