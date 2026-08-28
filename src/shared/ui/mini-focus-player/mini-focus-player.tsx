'use client'

import { useBackgroundSound } from '@/shared/hooks/focus/use-background-sound'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { useTimerStore } from '@/shared/stores/timer.store'
import { PauseIcon } from '@/shared/ui/icons/focus/pause-icon'
import { PlayIcon } from '@/shared/ui/icons/focus/play-icon'
import { ResetIcon } from '@/shared/ui/icons/focus/reset-icon'
import { MinimizeIcon } from '@/shared/ui/icons/minimize-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CollapsedPlayer } from './components/collapsed-player/collapsed-player'
import { SoundPopover } from './components/sound-popover/sound-popover'
import classes from './mini-focus-player.module.scss'

const STORAGE_KEY = 'mini_player_collapsed'

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

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved !== null) {
			setIsCollapsed(saved === 'true')
		}
	}, [])

	const handleToggleCollapse = (collapsed: boolean) => {
		setIsCollapsed(collapsed)
		localStorage.setItem(STORAGE_KEY, String(collapsed))
	}

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

	return (
		<AnimatePresence>
			{isCollapsed ? (
				<CollapsedPlayer emoji={emoji} displayTime={displayTime} onExpand={() => handleToggleCollapse(false)} />
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
						<div className={classes.timeGroup} onClick={() => router.push('/focus')} title='Open Focus Page'>
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
							<SoundPopover
								isOpen={isSoundOpen}
								activeSound={activeSound}
								volume={volume}
								soundRef={soundRef}
								onToggleOpen={() => setIsSoundOpen(prev => !prev)}
								onSelectSound={selectSound}
								onSetVolume={setVolume}
							/>

							<button
								type='button'
								className={classes.iconBtn}
								onClick={() => handleToggleCollapse(true)}
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
