'use client'

import { SettingsIcon } from '@/shared/ui/icons/focus/settings-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { BackgroundSoundsDropdown } from './components/header/background-sounds-dropdown/background-sounds-dropdown'
import { TimerSettingsModal } from './components/header/timer-settings-modal/timer-settings-modal'
import { Timer } from './components/main/timer/timer'
import classes from './page.module.scss'

export default function Focus() {
	const [isSettingsModalOpened, setIsSettingsModalOpened] = useState(false)

	return (
		<>
			<div className={classes.focusPage}>
				<header className={classes.header}>
					<BackgroundSoundsDropdown />
					<button className={classes.settingsButton} onClick={() => setIsSettingsModalOpened(true)}>
						<SettingsIcon />
					</button>
				</header>
				<main className={classes.timer}>
					<Timer />
				</main>
			</div>
			<Modal isVisible={isSettingsModalOpened} onClose={() => setIsSettingsModalOpened(false)}>
				<TimerSettingsModal />
			</Modal>
		</>
	)
}
