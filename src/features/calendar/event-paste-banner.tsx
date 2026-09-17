'use client'

import classes from '@/app/(main)/planner/components/main/paste-banner/paste-banner.module.scss'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useEffect } from 'react'

interface EventPasteBannerProps {
	copiedEvent: SXEvent
	onCancel: () => void
}

export const EventPasteBanner = ({ copiedEvent, onCancel }: EventPasteBannerProps) => {
	useEffect(() => {
		const cancelOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onCancel()
		window.addEventListener('keydown', cancelOnEscape)
		return () => window.removeEventListener('keydown', cancelOnEscape)
	}, [onCancel])

	return (
		<div className={classes.pasteBanner}>
			<div className={classes.info}>
				<span className={classes.label}>Copying:</span>
				<strong className={classes.eventTitle}>{copiedEvent.title}</strong>
			</div>
			<p className={classes.hint}>Choose a highlighted day to paste the event</p>
			<button onClick={onCancel} className={classes.cancelBtn}>
				Cancel
			</button>
		</div>
	)
}
