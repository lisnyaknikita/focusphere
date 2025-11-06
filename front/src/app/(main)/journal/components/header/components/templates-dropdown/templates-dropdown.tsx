import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import classes from './templates-dropdown.module.scss'

const templates = [
	'Emotional Check-In',
	'Gratitude',
	'Mind Dump',
	'Anxiety Journal',
	'Success Journal',
	'Morning Planning',
	'Evening Reflection',
]

export const TemplatesDropdown = () => {
	const [open, setOpen] = useState(false)

	return (
		<div className={clsx(classes.templates, open && 'opened')}>
			<button className={classes.trigger} onClick={() => setOpen(prev => !prev)}>
				<span>Templates</span>
				<svg width='11' height='6' viewBox='0 0 11 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M10.7715 0.247421C10.6985 0.169022 10.6116 0.106794 10.5159 0.0643287C10.4201 0.0218632 10.3175 0 10.2138 0C10.11 0 10.0074 0.0218632 9.91162 0.0643287C9.81588 0.106794 9.72899 0.169022 9.65596 0.247421L6.05779 4.07837C5.98476 4.15677 5.89787 4.219 5.80213 4.26146C5.7064 4.30393 5.60371 4.32579 5.5 4.32579C5.39629 4.32579 5.2936 4.30393 5.19787 4.26146C5.10213 4.219 5.01524 4.15677 4.94221 4.07837L1.34404 0.247421C1.27101 0.169022 1.18412 0.106794 1.08838 0.0643287C0.992645 0.0218632 0.88996 0 0.786248 0C0.682536 0 0.57985 0.0218632 0.484115 0.0643287C0.388379 0.106794 0.301488 0.169022 0.228454 0.247421C0.0821305 0.404141 0 0.616141 0 0.837119C0 1.0581 0.0821305 1.2701 0.228454 1.42682L3.83447 5.26613C4.27639 5.73605 4.87543 6 5.5 6C6.12457 6 6.72361 5.73605 7.16553 5.26613L10.7715 1.42682C10.9179 1.2701 11 1.0581 11 0.837119C11 0.616141 10.9179 0.404141 10.7715 0.247421Z'
						fill='var(--text)'
					/>
				</svg>
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						className={classes.dropdown}
						initial={{ opacity: 0, scale: 0.95, y: -6 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.97, y: -4 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}
					>
						{templates.map((sound, i) => (
							<button className={classes.templateItem} key={i}>
								{sound}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
