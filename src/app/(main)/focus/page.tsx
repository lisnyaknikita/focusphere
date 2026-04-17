'use client'

import { SettingsIcon } from '@/shared/ui/icons/focus/settings-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useState } from 'react'
import { BackgroundSoundsDropdown } from './components/header/background-sounds-dropdown/background-sounds-dropdown'
import { TimerSettingsModal } from './components/header/timer-settings-modal/timer-settings-modal'
import { Timer } from './components/main/timer/timer'
import classes from './page.module.scss'

export default function Focus() {
	const [isSettingsModalOpened, setIsSettingsModalOpened] = useState(false)
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'left',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const handleOpenSettings = () => {
		setIsSettingsModalOpened(true)
		setIsTooltipOpen(false)
	}

	return (
		<>
			<div className={classes.focusPage}>
				<header className={classes.header}>
					<BackgroundSoundsDropdown />
					<button
						ref={refs.setReference}
						className={classes.settingsButton}
						onClick={handleOpenSettings}
						{...getReferenceProps()}
					>
						<SettingsIcon />
						{isTooltipOpen && (
							<div
								ref={refs.setFloating}
								style={{
									...floatingStyles,
									background: 'var(--save-button-bg)',
									color: 'var(--save-button-text)',
									padding: '4px 8px',
									borderRadius: '5px',
									fontSize: '13px',
									fontWeight: 700,
									zIndex: 1000,
									whiteSpace: 'nowrap',
								}}
								{...getFloatingProps()}
							>
								Timer settings
							</div>
						)}
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
