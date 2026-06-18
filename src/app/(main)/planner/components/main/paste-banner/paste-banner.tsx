'use client'

import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { useEffect } from 'react'
import classes from './paste-banner.module.scss'

interface PasteBannerProps {
	copiedTimeBlock: SXEvent
	onCancel: () => void
}

export const PasteBanner = ({ copiedTimeBlock, onCancel }: PasteBannerProps) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onCancel()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [onCancel])

	return (
		<div className={classes.pasteBanner}>
			<div className={classes.info}>
				<span className={classes.label}>Copying:</span>
				<strong className={classes.eventTitle}>{copiedTimeBlock.title}</strong>
			</div>
			<p className={classes.hint}>Click on any day in the calendar to paste</p>
			<button onClick={onCancel} className={classes.cancelBtn}>
				Cancel
			</button>
		</div>
	)
}
