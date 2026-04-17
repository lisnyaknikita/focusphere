'use client'

import { useTimerStore } from '@/shared/stores/timer.store'
import { PauseIcon } from '@/shared/ui/icons/focus/pause-icon'
import { PlayIcon } from '@/shared/ui/icons/focus/play-icon'
import { ResetIcon } from '@/shared/ui/icons/focus/reset-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import clsx from 'clsx'
import { useState } from 'react'
import classes from './timer.module.scss'

export const Timer = () => {
	const [isResetTooltipOpen, setIsResetTooltipOpen] = useState(false)

	const timeLeft = useTimerStore(s => s.timeLeft)
	const status = useTimerStore(s => s.status)
	const startTimer = useTimerStore(s => s.startTimer)
	const pauseTimer = useTimerStore(s => s.pauseTimer)
	const resetTimer = useTimerStore(s => s.resetTimer)
	const currentSession = useTimerStore(s => s.currentSession)
	const settings = useTimerStore(s => s.settings)
	// const jumpToFinish = useTimerStore(s => s.jumpToFinish)

	const minutes = Math.floor(timeLeft / 60)
	const seconds = timeLeft % 60
	const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

	const isRunning = status === 'work' || status === 'break'
	const handleAction = isRunning ? pauseTimer : startTimer

	const {
		refs: resetRefs,
		floatingStyles: resetStyles,
		context: resetContext,
	} = useFloating({
		open: isResetTooltipOpen,
		onOpenChange: setIsResetTooltipOpen,
		placement: 'bottom',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const resetHover = useHover(resetContext)

	const { getReferenceProps: getResetProps, getFloatingProps: getResetFloatingProps } = useInteractions([resetHover])

	if (status === 'completed') {
		return (
			<div className={clsx(classes.timerInner, status === 'completed' && 'completed')}>
				<h2 className={classes.timerLabel}>All sessions done!</h2>
				<button className={classes.completedResetButton} onClick={resetTimer}>
					Restart
				</button>
			</div>
		)
	}

	return (
		<div className={classes.timerInner}>
			<h2 className={classes.timerLabel}>{status === 'break' ? 'Break' : 'Flow'}</h2>
			<div className={classes.time}>
				<span>{displayTime.split(':')[0]}</span>
				<span>:</span>
				<span>{displayTime.split(':')[1]}</span>
			</div>
			<ul className={classes.circles}>
				{Array.from({ length: settings.totalSessions }).map((_, index) => {
					const isCompleted = index < currentSession - 1
					const isActive = index === currentSession - 1

					return (
						<li
							key={index}
							className={clsx(
								classes.circle,
								isCompleted && 'completed',
								isActive && 'active',
								isActive && status === 'break' && 'onBreak'
							)}
						/>
					)
				})}
			</ul>
			<button className={classes.actionButton} onClick={handleAction}>
				{isRunning ? <PauseIcon /> : <PlayIcon />}
			</button>
			{status !== 'idle' && (
				<>
					<button
						ref={resetRefs.setReference}
						className={classes.resetButton}
						onClick={() => {
							resetTimer()
							setIsResetTooltipOpen(false)
						}}
						{...getResetProps()}
					>
						<ResetIcon />
					</button>
					{isResetTooltipOpen && (
						<div
							ref={resetRefs.setFloating}
							style={{
								...resetStyles,
								background: 'var(--save-button-bg)',
								color: 'var(--save-button-text)',
								padding: '4px 8px',
								borderRadius: '5px',
								fontSize: '13px',
								fontWeight: 700,
								zIndex: 1000,
							}}
							{...getResetFloatingProps()}
						>
							Reset timer
						</div>
					)}
				</>
			)}
			{/* {(status === 'work' || status === 'break') && (
				<button
					onClick={jumpToFinish}
					style={{
						position: 'absolute',
						bottom: '-40px',
						fontSize: '10px',
						opacity: 0.5,
					}}
				>
					⏩ Test Transition (5s left)
				</button>
			)} */}
		</div>
	)
}
