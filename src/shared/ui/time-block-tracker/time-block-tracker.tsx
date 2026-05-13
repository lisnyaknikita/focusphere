'use client'

import { useActiveBlockLogic } from '@/shared/hooks/active-block/use-active-block-logic'
import { useTimeBlocks } from '@/shared/hooks/planner/use-timeblocks'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useTimeBlockUIStore } from '@/shared/stores/time-block-ui-store'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useState } from 'react'
import classes from './time-block-tracker.module.scss'

export const TimeBlockTracker = () => {
	const [isOpen, setIsOpen] = useState(false)
	const { user } = useUser()
	const { timeBlocks, isLoading } = useTimeBlocks(user)
	const { activeBlock, progress } = useActiveBlockLogic(timeBlocks)

	const { isEnabled } = useTimeBlockUIStore()

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
					style={{
						width: `${progress}%`,
						backgroundColor: activeBlock?.color ?? 'transparent',
					}}
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
					{activeBlock ? (
						<>
							<span className={classes.tooltipLabel}>Current session:</span>
							<span className={classes.tooltipTitle}>{activeBlock.title}</span>
							<span className={classes.tooltipProgress}>· {Math.round(progress)}% completed</span>
						</>
					) : (
						<span>No active sessions</span>
					)}
				</div>
			)}
		</>
	)
}
