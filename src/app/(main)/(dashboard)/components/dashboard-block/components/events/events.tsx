'use client'

import { mapEventToScheduleX } from '@/lib/events/event-mapper'
import { useEventsByToday } from '@/shared/hooks/events/use-events-by-today'
import { useSectionHeight } from '@/shared/hooks/section-height/useSectionHeight'
import { CalendarEvent } from '@/shared/types/event'
import { EventInfoModal } from '@/shared/ui/event-info-modal/event-info-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './events.module.scss'

export const EventsBlock = () => {
	const { sectionRef, listHeight } = useSectionHeight(0.72)
	const { events, isLoading } = useEventsByToday()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<SXEvent | null>(null)

	const handleEventClick = (event: CalendarEvent) => {
		const sxEvent = mapEventToScheduleX(event)

		setSelectedEvent(sxEvent)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setTimeout(() => setSelectedEvent(null), 300)
	}

	return (
		<>
			<section className={classes.events} ref={sectionRef}>
				<h2>Events for today:</h2>
				{events.length === 0 && !isLoading ? (
					<p className={classes.noEventsMessage}>No events for today</p>
				) : events.length === 0 ? (
					<BeatLoader color='#aaa' size={10} className={classes.loader} />
				) : (
					<ul className={classes.eventsList} style={{ maxHeight: `${listHeight}px` }}>
						{events.map(item => (
							<li key={item.$id} className={classes.eventItem}>
								<button type='button' onClick={() => handleEventClick(item)}>
									{item.title}
								</button>
							</li>
						))}
					</ul>
				)}
			</section>
			<Modal isVisible={isModalOpen} onClose={handleCloseModal}>
				{selectedEvent && <EventInfoModal event={selectedEvent} />}
			</Modal>
		</>
	)
}
