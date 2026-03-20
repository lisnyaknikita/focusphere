'use client'

import { useBackgroundSound } from '@/shared/hooks/focus/use-background-sound'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import classes from './background-sounds-dropdown.module.scss'

const SOUNDS = [
	{ id: 'pink-noise' as const, label: 'Pink noise' },
	{ id: 'brown-noise' as const, label: 'Brown noise' },
	{ id: 'lofi' as const, label: 'Lofi' },
]

export const BackgroundSoundsDropdown = () => {
	const [open, setOpen] = useState(false)

	const { activeSound, selectSound, volume, setVolume } = useBackgroundSound()

	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	return (
		<div ref={dropdownRef} className={clsx(classes.backgroundSounds, open && 'opened')}>
			<button className={classes.trigger} onClick={() => setOpen(prev => !prev)}>
				{activeSound ? SOUNDS.find(s => s.id === activeSound)?.label : 'Background sound'}
				<ArrowBottomIcon />
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
						{SOUNDS.map(sound => (
							<button
								className={clsx(classes.soundItem, activeSound === sound.id && 'activeSound')}
								key={sound.id}
								onClick={() => selectSound(sound.id)}
							>
								<span>{sound.label}</span>
							</button>
						))}
						{activeSound && (
							<div className={classes.volumeRow}>
								<input
									type='range'
									min={0}
									max={1}
									step={0.01}
									value={volume}
									onChange={e => setVolume(Number(e.target.value))}
									className={classes.volumeSlider}
								/>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
