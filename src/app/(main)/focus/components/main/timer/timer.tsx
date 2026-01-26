'use client'

import { useTimer } from '@/shared/context/timer-context'
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
				{isRunning ? (
					<svg width='60' height='60' viewBox='0 0 70 70' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M18.9583 0C16.2509 0 13.6544 1.07552 11.74 2.98995C9.82552 4.90439 8.75 7.50092 8.75 10.2083V59.7917C8.75 62.4991 9.82552 65.0956 11.74 67.0101C13.6544 68.9245 16.2509 70 18.9583 70C21.6658 70 24.2623 68.9245 26.1767 67.0101C28.0911 65.0956 29.1667 62.4991 29.1667 59.7917V10.2083C29.1667 7.50092 28.0911 4.90439 26.1767 2.98995C24.2623 1.07552 21.6658 0 18.9583 0ZM23.3333 59.7917C23.3333 60.952 22.8724 62.0648 22.0519 62.8853C21.2315 63.7057 20.1187 64.1667 18.9583 64.1667C17.798 64.1667 16.6852 63.7057 15.8647 62.8853C15.0443 62.0648 14.5833 60.952 14.5833 59.7917V10.2083C14.5833 9.04801 15.0443 7.93521 15.8647 7.11474C16.6852 6.29427 17.798 5.83333 18.9583 5.83333C20.1187 5.83333 21.2315 6.29427 22.0519 7.11474C22.8724 7.93521 23.3333 9.04801 23.3333 10.2083V59.7917Z'
							fill='var(--text)'
						/>
						<path
							d='M51.0423 0C48.3349 0 45.7384 1.07552 43.8239 2.98995C41.9095 4.90439 40.834 7.50092 40.834 10.2083V59.7917C40.834 62.4991 41.9095 65.0956 43.8239 67.0101C45.7384 68.9245 48.3349 70 51.0423 70C53.7497 70 56.3463 68.9245 58.2607 67.0101C60.1751 65.0956 61.2507 62.4991 61.2507 59.7917V10.2083C61.2507 7.50092 60.1751 4.90439 58.2607 2.98995C56.3463 1.07552 53.7497 0 51.0423 0ZM55.4173 59.7917C55.4173 60.952 54.9564 62.0648 54.1359 62.8853C53.3154 63.7057 52.2026 64.1667 51.0423 64.1667C49.882 64.1667 48.7692 63.7057 47.9487 62.8853C47.1283 62.0648 46.6673 60.952 46.6673 59.7917V10.2083C46.6673 9.04801 47.1283 7.93521 47.9487 7.11474C48.7692 6.29427 49.882 5.83333 51.0423 5.83333C52.2026 5.83333 53.3154 6.29427 54.1359 7.11474C54.9564 7.93521 55.4173 9.04801 55.4173 10.2083V59.7917Z'
							fill='var(--text)'
						/>
					</svg>
				) : (
					<svg width='60' height='60' viewBox='0 0 70 70' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M59.7742 23.2398L31.9492 2.8231C29.7759 1.23173 27.2044 0.273336 24.5197 0.0542042C21.8351 -0.164928 19.1422 0.36376 16.7396 1.58165C14.3371 2.79953 12.3188 4.65902 10.9085 6.95394C9.49824 9.24885 8.75113 11.8895 8.75 14.5831V55.4164C8.75048 58.1113 9.49764 60.7532 10.9086 63.0492C12.3195 65.3451 14.339 67.2052 16.7429 68.423C19.1468 69.6409 21.8412 70.1688 24.527 69.9482C27.2127 69.7277 29.7849 68.7672 31.9579 67.1735L59.7829 46.7569C61.6299 45.4023 63.132 43.6318 64.1673 41.5887C65.2026 39.5456 65.7421 37.2873 65.7421 34.9969C65.7421 32.7064 65.2026 30.4481 64.1673 28.405C63.132 26.3619 61.6299 24.5914 59.7829 23.2369L59.7742 23.2398ZM56.3208 42.0523L28.4958 62.4689C27.1921 63.4216 25.6502 63.995 24.0408 64.1255C22.4314 64.2561 20.8173 63.9388 19.3771 63.2087C17.9369 62.4786 16.7267 61.3643 15.8807 59.989C15.0346 58.6137 14.5856 57.0311 14.5833 55.4164V14.5831C14.5671 12.9654 15.0077 11.3759 15.8543 9.9973C16.701 8.61871 17.9194 7.50695 19.3696 6.78977C20.603 6.16237 21.967 5.83461 23.3508 5.8331C25.2055 5.84019 27.009 6.44236 28.4958 7.55102L56.3208 27.9677C57.4277 28.7806 58.3277 29.8425 58.948 31.0677C59.5683 32.2929 59.8916 33.6469 59.8916 35.0202C59.8916 36.3935 59.5683 37.7475 58.948 38.9727C58.3277 40.1978 57.4277 41.2598 56.3208 42.0727V42.0523Z'
							fill='var(--text)'
						/>
					</svg>
				)}
			</button>
			{status !== 'idle' && (
				<button className={classes.resetButton} onClick={resetTimer}>
					<svg width='30' height='30' viewBox='0 0 70 70' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<g clipPath='url(#clip0_2416_2174)'>
							<path
								d='M34.9997 0C26.2759 0 18.0451 3.24625 11.6663 8.9775V2.91667C11.6663 1.30375 10.3597 0 8.74966 0C7.13966 0 5.83299 1.30375 5.83299 2.91667V14.5833C5.83299 17.8004 8.44924 20.4167 11.6663 20.4167H23.333C24.943 20.4167 26.2497 19.1129 26.2497 17.5C26.2497 15.8871 24.943 14.5833 23.333 14.5833H14.2038C19.6755 9.00375 27.1013 5.83333 34.9997 5.83333C51.0822 5.83333 64.1663 18.9175 64.1663 35C64.1663 51.0825 51.0822 64.1667 34.9997 64.1667C19.8038 64.1667 7.31466 52.7683 5.95257 37.6542C5.80966 36.05 4.41841 34.8658 2.78507 35.0117C1.18091 35.1575 -0.000342919 36.575 0.142574 38.1792C1.77882 56.3208 16.7647 70 34.9997 70C54.2992 70 69.9997 54.2996 69.9997 35C69.9997 15.7004 54.2992 0 34.9997 0Z'
								fill='var(--text)'
							/>
						</g>
						<defs>
							<clipPath id='clip0_2416_2174'>
								<rect width='70' height='70' fill='var(--text)' />
							</clipPath>
						</defs>
					</svg>
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
