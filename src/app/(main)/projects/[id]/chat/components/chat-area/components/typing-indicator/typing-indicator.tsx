'use client'

import { ActiveTyper } from '@/shared/hooks/projects/chat/use-typing-indicator'
import { AnimatePresence, motion } from 'framer-motion'
import classes from './typing-indicator.module.scss'

interface TypingIndicatorProps {
	typers: ActiveTyper[]
}

export const TypingIndicator = ({ typers }: TypingIndicatorProps) => {
	const isTyping = typers.length > 0

	let label = ''
	if (typers.length === 1) {
		label = `${typers[0].userName} is typing`
	} else if (typers.length === 2) {
		label = `${typers[0].userName} and ${typers[1].userName} are typing`
	} else if (typers.length > 2) {
		label = `${typers[0].userName}, ${typers[1].userName} and ${typers.length - 2} others are typing`
	}

	return (
		<AnimatePresence>
			{isTyping && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
					style={{ overflow: 'hidden' }}
				>
					<div className={classes.container} role='status' aria-live='polite' aria-label={label}>
						<span className={classes.text}>{label}</span>
						<span className={classes.dots} aria-hidden='true'>
							<span className={classes.dot} />
							<span className={classes.dot} />
							<span className={classes.dot} />
						</span>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
