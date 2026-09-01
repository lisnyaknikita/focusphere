'use client'

import { CalendarIcon } from '@/shared/ui/icons/planner/calendar-icon'
import clsx from 'clsx'
import classes from './calendar-toggle.module.scss'

interface CalendarToggleProps {
	showCalendarEvents: boolean
	onToggle: () => void
}

export const CalendarToggle = ({ showCalendarEvents, onToggle }: CalendarToggleProps) => {
	return (
		<button
			type='button'
			className={clsx(classes.toggleContainer, showCalendarEvents && classes.active)}
			onClick={onToggle}
			title={showCalendarEvents ? 'Hide calendar events on planner' : 'Show calendar events on planner'}
		>
			<CalendarIcon width={18} height={18} />
			<span className={classes.label}>Calendar events</span>
			<div className={clsx(classes.toggle, showCalendarEvents && classes.active)} />
		</button>
	)
}
