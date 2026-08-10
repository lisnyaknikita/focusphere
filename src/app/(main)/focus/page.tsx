'use client'

import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { SettingsIcon } from '@/shared/ui/icons/focus/settings-icon'
import { StatsIcon } from '@/shared/ui/icons/focus/stats-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { BackgroundSoundsDropdown } from './components/header/background-sounds-dropdown/background-sounds-dropdown'
import { TimerSettingsModal } from './components/header/timer-settings-modal/timer-settings-modal'
import { TimerStatsModal } from './components/header/timer-stats-modal/timer-stats-modal'
import { Timer } from './components/main/timer/timer'
import classes from './page.module.scss'

export default function Focus() {
	const [isSettingsModalOpened, setIsSettingsModalOpened] = useState(false)
	const [isStatsModalOpened, setIsStatsModalOpened] = useState(false)

	return (
		<>
			<div className={classes.focusPage}>
				<header className={classes.header}>
					<BackgroundSoundsDropdown />

					<div className={classes.headerButtons}>
						<ActionTooltip text='Focus statistics' placement='bottom'>
							{(setRef, refProps) => (
								<button
									ref={setRef}
									className={classes.settingsButton}
									onClick={() => setIsStatsModalOpened(true)}
									{...refProps}
								>
									<StatsIcon />
								</button>
							)}
						</ActionTooltip>

						<ActionTooltip text='Timer settings' placement='bottom'>
							{(setRef, refProps) => (
								<button
									ref={setRef}
									className={classes.settingsButton}
									onClick={() => setIsSettingsModalOpened(true)}
									{...refProps}
								>
									<SettingsIcon />
								</button>
							)}
						</ActionTooltip>
					</div>
				</header>

				<main className={classes.timer}>
					<Timer />
				</main>
			</div>

			<Modal isVisible={isSettingsModalOpened} onClose={() => setIsSettingsModalOpened(false)}>
				<TimerSettingsModal />
			</Modal>

			<Modal isVisible={isStatsModalOpened} onClose={() => setIsStatsModalOpened(false)}>
				<TimerStatsModal />
			</Modal>
		</>
	)
}
