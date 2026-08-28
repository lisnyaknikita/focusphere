'use client'

import { ExpandIcon } from '@/shared/ui/icons/expand-icon'
import { motion } from 'framer-motion'
import classes from '../../mini-focus-player.module.scss'

interface CollapsedPlayerProps {
	emoji: string
	displayTime: string
	onExpand: () => void
}

export const CollapsedPlayer = ({ emoji, displayTime, onExpand }: CollapsedPlayerProps) => {
	return (
		<motion.div
			key='collapsed'
			className={classes.collapsedTrigger}
			initial={{ scale: 0.8, opacity: 0, y: 20 }}
			animate={{ scale: 1, opacity: 1, y: 0 }}
			exit={{ scale: 0.8, opacity: 0, y: 20 }}
			transition={{ type: 'spring', damping: 22, stiffness: 260 }}
			onClick={onExpand}
			title='Expand timer'
		>
			<span className={classes.collapsedEmoji}>{emoji}</span>
			<span className={classes.collapsedTime}>{displayTime}</span>
			<div className={classes.collapsedExpandIcon}>
				<ExpandIcon width={14} height={14} />
			</div>
		</motion.div>
	)
}
