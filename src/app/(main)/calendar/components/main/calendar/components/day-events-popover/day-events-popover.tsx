'use client'

import { CALENDARS_CONFIG, getCalendarIdByColor } from '@/lib/events/calendar-config'
import { useSettingsStore } from '@/shared/stores/settings.store'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions } from '@floating-ui/react'
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

const getDisplayColor = (color: string): string => {
	const calendarId = getCalendarIdByColor(color)
	const config = CALENDARS_CONFIG[calendarId as keyof typeof CALENDARS_CONFIG]
	return config?.darkColors.container || color
}

export const DayEventsPopover = ({ dateStr, anchorEl, events, onClose, onEventClick }: DayEventsPopoverProps) => {
	const timeFormat = useSettingsStore(state => state.timeFormat)
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const isOpen = Boolean(dateStr && anchorEl)

	const { x, y, refs, strategy, context } = useFloating({
		open: isOpen,
		onOpenChange: open => !open && onClose(),
		strategy: 'fixed',
		placement: 'bottom-start',
		elements: {
			reference: anchorEl,
		},
		middleware: [offset(6), flip(), shift({ padding: 16 })],
		whileElementsMounted: autoUpdate,
	})

	const dismiss = useDismiss(context, {
		outsidePress: true,
		escapeKey: true,
	})

	const { getFloatingProps } = useInteractions([dismiss])

	const { weekday, dayNum, dayEvents } = useMemo(() => {
		if (!dateStr) return { weekday: '', dayNum: '', dayEvents: [] }

		const [year, month, day] = dateStr.split('-').map(Number)
		const dateObj = new Date(year, month - 1, day)
		const weekdayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()

		const filtered = events.filter(ev => {
			const startStr = String(ev.start).slice(0, 10)
			const endStr = String(ev.end).slice(0, 10)
			return startStr <= dateStr && dateStr <= endStr
		})

		return { weekday: weekdayName, dayNum: String(day), dayEvents: filtered }
	}, [dateStr, events])

	const formatTime = (startVal: unknown, endVal: unknown) => {
		const startStr = String(startVal ?? '')
		const endStr = String(endVal ?? '')
		const startDay = startStr.slice(0, 10)
		const endDay = endStr.slice(0, 10)

		const timeMatch = startStr.match(/\d{2}:\d{2}/)
		if (!timeMatch || (startDay !== endDay && dateStr && startDay < dateStr && endDay > dateStr)) {
			return 'All day'
		}

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
			{isOpen && (
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
					{...getFloatingProps()}
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
									style={{ backgroundColor: getDisplayColor(String(event.color || '')) }}
								/>
								<span className={classes.eventTime}>{formatTime(event.start, event.end)}</span>
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
