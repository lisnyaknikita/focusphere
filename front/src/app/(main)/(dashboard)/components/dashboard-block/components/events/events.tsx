'use client'

import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import Link from 'next/link'
import classes from './events.module.scss'

export const EventsBlock = () => {
	const { sectionRef, listHeight } = useSectionHeight(0.73)

	return (
		<section className={classes.events} ref={sectionRef}>
			<h2>Events for today:</h2>
			<ul className={classes.eventsList} style={{ maxHeight: `${listHeight}px` }}>
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
				<li className={classes.eventItem}>
					<Link href={'/calendar/123'}>Event 1</Link>
				</li>
			</ul>
		</section>
	)
}
