'use client'

import { useQuickIdeas } from '@/shared/hooks/use-quick-ideas/use-quick-ideas'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IdeaIcon } from '../icons/idea-icon'
import classes from './evening-ideas-popup.module.scss'

export const EveningIdeasPopup = () => {
	const { ideas, isLoading } = useQuickIdeas()
	const [isVisible, setIsVisible] = useState(false)

	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (isLoading || ideas.length === 0) return

		const now = new Date()
		const currentHour = now.getHours()
		const todayStr = now.toISOString().split('T')[0]
		const isDismissed = localStorage.getItem(`evening_ideas_dismissed_${todayStr}`)

		if (currentHour >= 19 && !isDismissed) {
			setIsVisible(true)
		}
	}, [ideas, isLoading])

	const handleDismiss = () => {
		const todayStr = new Date().toISOString().split('T')[0]
		localStorage.setItem(`evening_ideas_dismissed_${todayStr}`, 'true')
		setIsVisible(false)
	}

	const handleOpenDrawer = () => {
		handleDismiss()
		const params = new URLSearchParams(window.location.search)
		params.set('drawer', 'quick-ideas')
		router.push(`${pathname}?${params.toString()}`, { scroll: false })
	}

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={classes.popupCard}
					initial={{ opacity: 0, y: 40, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.95 }}
					transition={{ duration: 0.25, ease: 'easeOut' }}
				>
					<button type='button' className={classes.closeBtn} onClick={handleDismiss} title='Close'>
						<CloseIcon width={14} height={14} />
					</button>

					<div className={classes.content}>
						<div className={classes.iconWrapper}>
							<IdeaIcon width={20} height={20} />
						</div>

						<div className={classes.textGroup}>
							<h4 className={classes.title}>Evening Idea Review</h4>
							<p className={classes.description}>
								You have <span className={classes.highlight}>{ideas.length}</span>{' '}
								{ideas.length === 1 ? 'unprocessed idea' : 'unprocessed ideas'}. Clear your mind before bed?
							</p>
						</div>
					</div>

					<div className={classes.shortcutHint}>
						<span>Also available via </span>
						<kbd className={classes.kbd}>⌘I</kbd> / <kbd className={classes.kbd}>Ctrl+I</kbd>
						<span> or Dashboard</span>
					</div>

					<button type='button' className={classes.actionBtn} onClick={handleOpenDrawer}>
						<span>Review Now</span>
					</button>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
