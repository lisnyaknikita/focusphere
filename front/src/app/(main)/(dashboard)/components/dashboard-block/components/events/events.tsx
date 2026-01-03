'use client'

import { useEventsByToday } from '@/shared/hooks/events/use-events-by-today'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { BeatLoader } from 'react-spinners'
import classes from './events.module.scss'

export const EventsBlock = () => {
	const { sectionRef, listHeight } = useSectionHeight(0.73)
	const { events } = useEventsByToday()

	return (
		<section className={classes.events} ref={sectionRef}>
			<h2>Events for today:</h2>
			{events.length === 0 ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<ul className={classes.eventsList} style={{ maxHeight: `${listHeight}px` }}>
					{events.map(item => (
						<li key={item.$id} className={classes.eventItem}>
							<button type='button'>{item.title}</button>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
//TODO: add no events text, implement modal window with event's info for each event
