'use client'

import { useTimer } from '@/shared/context/timer-context'
import { PauseIcon } from '@/shared/ui/icons/focus/pause-icon'
import { PlayIcon } from '@/shared/ui/icons/focus/play-icon'
import { ResetIcon } from '@/shared/ui/icons/focus/reset-icon'
import clsx from 'clsx'
import classes from './timer.module.scss'

export const Timer = () => {
	const { timeLeft, status, startTimer, pauseTimer, resetTimer, currentSession, settings } = useTimer()

	const minutes = Math.floor(timeLeft / 60)
	const seconds = timeLeft % 60
	const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

	const isRunning = status === 'work' || status === 'break'
	const handleAction = isRunning ? pauseTimer : startTimer

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
				<button className={classes.resetButton} onClick={resetTimer}>
					<ResetIcon />
				</button>
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
