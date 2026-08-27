'use client'

import { useBackgroundSound } from '@/shared/hooks/focus/use-background-sound'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { SoundOption } from '@/shared/stores/background-sound.store'
import { useTimerStore } from '@/shared/stores/timer.store'
import { ExpandIcon } from '@/shared/ui/icons/expand-icon'
import { PauseIcon } from '@/shared/ui/icons/focus/pause-icon'
import { PlayIcon } from '@/shared/ui/icons/focus/play-icon'
import { ResetIcon } from '@/shared/ui/icons/focus/reset-icon'
import { MinimizeIcon } from '@/shared/ui/icons/minimize-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { NoSoundIcon } from '../icons/focus/volume-off-icon'
import classes from './mini-focus-player.module.scss'

const SOUNDS: { id: SoundOption; label: string }[] = [
	{ id: 'white-noise', label: 'White noise' },
	{ id: 'pink-noise', label: 'Pink noise' },
	{ id: 'brown-noise', label: 'Brown noise' },
	{ id: 'lofi', label: 'Lofi' },
	{ id: 'soundtrack', label: 'Soundtrack' },
]

export const MiniFocusPlayer = () => {
	const pathname = usePathname()
	const router = useRouter()

	const status = useTimerStore(s => s.status)
	const timeLeft = useTimerStore(s => s.timeLeft)
	const mode = useTimerStore(s => s.mode)
	const startTimer = useTimerStore(s => s.startTimer)
	const pauseTimer = useTimerStore(s => s.pauseTimer)
	const resetTimer = useTimerStore(s => s.resetTimer)

	const { activeSound, selectSound, volume, setVolume } = useBackgroundSound()

	const [isCollapsed, setIsCollapsed] = useState(false)
	const [isSoundOpen, setIsSoundOpen] = useState(false)

	const soundRef = useClickOutside<HTMLDivElement>(() => setIsSoundOpen(false), isSoundOpen)

	if (pathname === '/focus') return null
	if (status === 'idle' && !activeSound) return null

	const mins = Math.floor(timeLeft / 60)
		.toString()
		.padStart(2, '0')
	const secs = (timeLeft % 60).toString().padStart(2, '0')
	const displayTime = `${mins}:${secs}`

	const isRunning = status === 'work' || status === 'break'
	const currentMode = status === 'paused' ? mode : status
	const emoji = currentMode === 'work' ? '🚀' : currentMode === 'break' ? '☕' : '⏱️'

	const handlePlayPause = () => {
		if (isRunning) {
			pauseTimer()
		} else {
			startTimer()
		}
	}

	const handleGoToFocus = () => {
		router.push('/focus')
	}

	return (
		<AnimatePresence>
			{isCollapsed ? (
				<motion.div
					key='collapsed'
					className={classes.collapsedTrigger}
					initial={{ scale: 0.8, opacity: 0, y: 20 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.8, opacity: 0, y: 20 }}
					transition={{ type: 'spring', damping: 22, stiffness: 260 }}
					onClick={() => setIsCollapsed(false)}
					title='Expand timer'
				>
					<span className={classes.collapsedEmoji}>{emoji}</span>
					<span className={classes.collapsedTime}>{displayTime}</span>
					<div className={classes.collapsedExpandIcon}>
						<ExpandIcon width={14} height={14} />
					</div>
				</motion.div>
			) : (
				<motion.div
					key='expanded'
					className={classes.expandedContainer}
					initial={{ y: 50, opacity: 0, x: '-50%' }}
					animate={{ y: 0, opacity: 1, x: '-50%' }}
					exit={{ y: 50, opacity: 0, x: '-50%' }}
					transition={{ type: 'spring', damping: 25, stiffness: 280 }}
				>
					<div className={classes.pillInner}>
						<div className={classes.timeGroup} onClick={handleGoToFocus} title='Open Focus Page'>
							<span className={classes.statusEmoji}>{emoji}</span>
							<span className={classes.timeText}>{displayTime}</span>
						</div>

						<div className={classes.controlsGroup}>
							<button
								type='button'
								className={classes.actionBtn}
								onClick={handlePlayPause}
								title={isRunning ? 'Pause' : 'Start'}
							>
								{isRunning ? <PauseIcon /> : <PlayIcon />}
							</button>

							{status !== 'idle' && (
								<button type='button' className={classes.actionBtn} onClick={resetTimer} title='Reset timer'>
									<ResetIcon />
								</button>
							)}
						</div>

						<div className={classes.optionsGroup}>
							<div ref={soundRef} className={classes.soundContainer}>
								<button
									type='button'
									className={clsx(classes.iconBtn, isSoundOpen && classes.iconBtnActive)}
									onClick={() => setIsSoundOpen(prev => !prev)}
									title='Sound settings'
								>
									<NoSoundIcon width={20} height={20} />
								</button>

								<AnimatePresence>
									{isSoundOpen && (
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
														onClick={() => selectSound(sound.id)}
													>
														<span className={classes.soundItemLabel}>{sound.label}</span>
														{activeSound === sound.id && <span className={classes.soundItemCheck}>✓</span>}
													</button>
												))}

												<button
													type='button'
													className={clsx(classes.soundItem, !activeSound && classes.soundItemActive)}
													onClick={() => selectSound(activeSound!)}
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
														onChange={e => setVolume(Number(e.target.value))}
														className={classes.volumeSlider}
													/>
													<span className={classes.volumeIcon}>🔊</span>
												</div>
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							<button
								type='button'
								className={classes.iconBtn}
								onClick={() => setIsCollapsed(true)}
								title='Collapse player'
							>
								<MinimizeIcon width={15} height={15} />
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
