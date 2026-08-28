'use client'

import { SoundOption } from '@/shared/stores/background-sound.store'
import { NoSoundIcon } from '@/shared/ui/icons/focus/volume-off-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import classes from '../../mini-focus-player.module.scss'

const SOUNDS: { id: SoundOption; label: string }[] = [
	{ id: 'white-noise', label: 'White noise' },
	{ id: 'pink-noise', label: 'Pink noise' },
	{ id: 'brown-noise', label: 'Brown noise' },
	{ id: 'lofi', label: 'Lofi' },
	{ id: 'soundtrack', label: 'Soundtrack' },
]

interface SoundPopoverProps {
	isOpen: boolean
	activeSound: SoundOption | null
	volume: number
	soundRef: React.RefObject<HTMLDivElement | null>
	onToggleOpen: () => void
	onSelectSound: (sound: SoundOption) => void
	onSetVolume: (volume: number) => void
}

export const SoundPopover = ({
	isOpen,
	activeSound,
	volume,
	soundRef,
	onToggleOpen,
	onSelectSound,
	onSetVolume,
}: SoundPopoverProps) => {
	return (
		<div ref={soundRef} className={classes.soundContainer}>
			<button
				type='button'
				className={clsx(classes.iconBtn, isOpen && classes.iconBtnActive)}
				onClick={onToggleOpen}
				title='Sound settings'
			>
				<NoSoundIcon width={20} height={20} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						className={classes.soundPopover}
						initial={{ opacity: 0, y: 6, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 6, scale: 0.95 }}
						transition={{ duration: 0.15 }}
					>
						<p className={classes.popoverLabel}>Background Sound</p>
						<div className={classes.soundList}>
							{SOUNDS.map(sound => (
								<button
									key={sound.id}
									type='button'
									className={clsx(classes.soundItem, activeSound === sound.id && classes.soundItemActive)}
									onClick={() => onSelectSound(sound.id)}
								>
									<span className={classes.soundItemLabel}>{sound.label}</span>
									{activeSound === sound.id && <span className={classes.soundItemCheck}>✓</span>}
								</button>
							))}

							<button
								type='button'
								className={clsx(classes.soundItem, !activeSound && classes.soundItemActive)}
								onClick={() => onSelectSound(activeSound!)}
							>
								<span className={classes.soundItemEmoji}>
									<NoSoundIcon width={14} height={14} />
								</span>
								<span className={classes.soundItemLabel}>Off</span>
								{!activeSound && <span className={classes.soundItemCheck}>✓</span>}
							</button>
						</div>

						{activeSound && (
							<div className={classes.volumeRow}>
								<span className={classes.volumeIcon}>🔈</span>
								<input
									type='range'
									min={0}
									max={1}
									step={0.01}
									value={volume}
									onChange={e => onSetVolume(Number(e.target.value))}
									className={classes.volumeSlider}
								/>
								<span className={classes.volumeIcon}>🔊</span>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
