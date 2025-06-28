import Link from 'next/link'
import classes from './events.module.scss'

export const EventsBlock = () => {
	return (
		<section className={classes.events}>
			<h2>Events for today:</h2>
			<ul className={classes.eventsList}>
				<li className={classes.eventItem}>
					<Link href={'/calendar/123'}>Event 1</Link>
				</li>
				<li className={classes.eventItem}>
					<Link href={'/calendar/123'}>Event 1</Link>
				</li>
				<li className={classes.eventItem}>
					<Link href={'/calendar/123'}>Event 1</Link>
				</li>
				<li className={classes.eventItem}>
					<Link href={'/calendar/123'}>Event 1</Link>
				</li>
				<li className={classes.eventItem}>
					<Link href={'/calendar/123'}>Event 1</Link>
				</li>
			</ul>
		</section>
	)
}
