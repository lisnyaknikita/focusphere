'use client'

import { useSettingsStore } from '@/shared/stores/settings.store'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import { CalendarEvent as SXEvent } from '@schedule-x/calendar'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import classes from './day-events-popover.module.scss'

interface DayEventsPopoverProps {
	dateStr: string | null
	anchorEl: HTMLElement | null
	events: SXEvent[]
	onClose: () => void
	onEventClick?: (event: SXEvent) => void
}

export const DayEventsPopover = ({ dateStr, anchorEl, events, onClose, onEventClick }: DayEventsPopoverProps) => {
	const timeFormat = useSettingsStore(state => state.timeFormat)
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const { x, y, refs, strategy } = useFloating({
		strategy: 'fixed',
		placement: 'bottom-start',
		elements: {
			reference: anchorEl,
		},
		middleware: [offset(6), flip(), shift({ padding: 16 })],
		whileElementsMounted: autoUpdate,
	})

	useEffect(() => {
		if (!dateStr || !anchorEl) return

		const handleMouseDownOutside = (event: MouseEvent) => {
			const target = event.target as Node
			const popoverEl = refs.floating.current

			if (popoverEl && !popoverEl.contains(target) && !anchorEl.contains(target)) {
				onClose()
			}
		}

		document.addEventListener('mousedown', handleMouseDownOutside)
		return () => {
			document.removeEventListener('mousedown', handleMouseDownOutside)
		}
	}, [dateStr, anchorEl, onClose, refs.floating])

	const { weekday, dayNum, dayEvents } = useMemo(() => {
		if (!dateStr) return { weekday: '', dayNum: '', dayEvents: [] }

		const dateObj = new Date(`${dateStr}T00:00:00`)
		const weekdayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
		const dayNumber = String(dateObj.getDate())

		const filtered = events.filter(ev => String(ev.start).startsWith(dateStr))

		return { weekday: weekdayName, dayNum: dayNumber, dayEvents: filtered }
	}, [dateStr, events])

	const formatTime = (startVal: unknown) => {
		const startStr = String(startVal ?? '')
		const timeMatch = startStr.match(/\d{2}:\d{2}/)
		if (!timeMatch) return 'All day'

		const [hoursStr, minutesStr] = timeMatch[0].split(':')
		let hours = parseInt(hoursStr, 10)

		if (timeFormat === '12h') {
			const ampm = hours >= 12 ? 'PM' : 'AM'
			hours = hours % 12 || 12
			return `${hours}:${minutesStr} ${ampm}`
		}

		return `${hoursStr}:${minutesStr}`
	}

	if (!isMounted) return null

	return createPortal(
		<AnimatePresence>
			{dateStr && anchorEl && (
				<motion.div
					ref={refs.setFloating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
					className={classes.popover}
					initial={{ opacity: 0, scale: 0.94, y: -4 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.94, y: -4 }}
					transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className={classes.header}>
						<button type='button' className={classes.closeBtn} onClick={onClose} title='Close'>
							<CloseIcon width={14} height={14} />
						</button>
						<span className={classes.weekday}>{weekday}</span>
						<span className={classes.dayNumber}>{dayNum}</span>
					</div>

					<div className={classes.eventsList}>
						{dayEvents.map(event => (
							<div
								key={event.id}
								className={classes.eventItem}
								onClick={() => {
									onEventClick?.(event)
									onClose()
								}}
							>
								<span
									className={classes.colorBadge}
									style={{ backgroundColor: (event.color as string) || '#D79716' }}
								/>
								<span className={classes.eventTime}>{formatTime(event.start)}</span>
								<span className={classes.eventTitle} title={event.title}>
									{event.title}
								</span>
							</div>
						))}
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
