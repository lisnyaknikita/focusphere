'use client'

import { useActiveEventLogic } from '@/shared/hooks/active-event/use-active-event-logic'
import { useEventsByToday } from '@/shared/hooks/events/use-events-by-today'
import { useEventTrackerUIStore } from '@/shared/stores/event-tracker-ui-store'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useEffect, useState } from 'react'
import classes from '../time-block-tracker/time-block-tracker.module.scss'

export const EventTracker = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [animatedProgress, setAnimatedProgress] = useState(0)
	const { isEnabled } = useEventTrackerUIStore()
	const { events, isLoading } = useEventsByToday()
	const { activeEvent, progress } = useActiveEventLogic(events)

	useEffect(() => {
		if (!isLoading && isEnabled) {
			const frame = requestAnimationFrame(() => setAnimatedProgress(progress))
			return () => cancelAnimationFrame(frame)
		}
	}, [isLoading, isEnabled, progress])

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})
	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])
	if (!isEnabled || isLoading) return null

	return (
		<>
			<div ref={refs.setReference} className={classes.lineWrapper} {...getReferenceProps()}>
				<div
					className={classes.progressLine}
					style={{ width: `${animatedProgress}%`, backgroundColor: activeEvent?.color ?? 'transparent' }}
				/>
			</div>
			{isOpen && (
				<div
					ref={refs.setFloating}
					style={{
						...floatingStyles,
						background: 'var(--save-button-bg)',
						color: 'var(--save-button-text)',
						padding: '4px 8px',
						borderRadius: '5px',
						fontSize: '13px',
						fontWeight: 700,
						zIndex: 1000,
					}}
					className={classes.tooltip}
					{...getFloatingProps()}
				>
					{activeEvent ? (
						<>
							<span className={classes.tooltipLabel}>Current event: </span>
							<span className={classes.tooltipTitle}>{activeEvent.title}</span>
							<span className={classes.tooltipProgress}> · {Math.round(progress)}% completed</span>
						</>
					) : (
						<span>No active events</span>
					)}
				</div>
			)}
		</>
	)
}
