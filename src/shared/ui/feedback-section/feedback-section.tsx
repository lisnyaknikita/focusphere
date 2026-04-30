'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowBottomIcon } from '../icons/arrow-bottom-icon'
import { BugIcon } from '../icons/feedback/bug-icon'
import { IdeaIcon } from '../icons/feedback/idea-icon'
import { MailIcon } from '../icons/welcome/mail-icon'
import classes from './feedback-section.module.scss'

export const FeedbackSection = () => {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const options = [
		{
			icon: <BugIcon />,
			label: 'Report an Issue',
			href: 'mailto:lisnyak.nikita@gmail.com?subject=Focusphere: Bug Report',
		},
		{
			icon: <IdeaIcon />,
			label: 'Feature Request',
			href: 'mailto:lisnyak.nikita@gmail.com?subject=Focusphere: Feature Idea',
		},
		{
			icon: <MailIcon />,
			label: 'General Inquiry',
			href: 'mailto:lisnyak.nikita@gmail.com?subject=Focusphere: General Inquiry',
		},
	]

	return (
		<div className={classes.container} ref={containerRef}>
			<button className={classes.trigger} onClick={() => setIsOpen(!isOpen)} type='button'>
				<span className={classes.triggerLabel}>Feedback & Support</span>
				<motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
					<ArrowBottomIcon />
				</motion.span>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className={classes.menu}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
						<div className={classes.optionsList}>
							{options.map((option, idx) => (
								<a key={idx} href={option.href} className={classes.optionItem}>
									<span className={classes.icon}>{option.icon}</span>
									<span className={classes.label}>{option.label}</span>
								</a>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
