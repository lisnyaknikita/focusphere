'use client'

import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { useEffect, useState } from 'react'
import classes from './shortcuts-modal.module.scss'

interface ShortcutItem {
	label: string
	mac: string[][]
	win: string[][]
}

interface ShortcutGroup {
	title: string
	items: ShortcutItem[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
	{
		title: 'QUICK ACTIONS',
		items: [
			{ label: 'Quick Ideas Drawer', mac: [['⌘', 'I']], win: [['Ctrl', 'I']] },
			{ label: 'Create Daily Task', mac: [['⌥', 'T']], win: [['Alt', 'T']] },
			{ label: 'Create Event', mac: [['⌥', 'E']], win: [['Alt', 'E']] },
			{ label: 'Toggle Focus Timer Player', mac: [['⌥', 'F']], win: [['Alt', 'F']] },
		],
	},
	{
		title: 'SYSTEM & UI',
		items: [
			{ label: 'Toggle Sidebar', mac: [['⌘', 'B']], win: [['Ctrl', 'B']] },
			{ label: 'Shortcuts Menu', mac: [['?']], win: [['?']] },
		],
	},
	{
		title: 'SEARCH & NAVIGATION',
		items: [
			{
				label: 'Search Projects / Notes',
				mac: [['/'], ['⌘', 'F']],
				win: [['/'], ['Ctrl', 'F']],
			},
			{
				label: 'Switch Pages (1...7)',
				mac: [['⌥', '1...7']],
				win: [['Alt', '1...7']],
			},
		],
	},
]

interface ShortcutsModalProps {
	onClose: () => void
}

export const ShortcutsModal = ({ onClose }: ShortcutsModalProps) => {
	const [isMac, setIsMac] = useState(true)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const userAgent = window.navigator.userAgent.toUpperCase()
			setIsMac(userAgent.includes('MAC'))
		}
	}, [])

	return (
		<div className={classes.modalInner}>
			<div className={classes.header}>
				<h3 className={classes.title}>Keyboard Shortcuts</h3>
				<button className={classes.closeBtn} onClick={onClose} aria-label='Close modal' type='button'>
					<CloseIcon width={18} height={18} />
				</button>
			</div>

			<div className={classes.content}>
				{SHORTCUT_GROUPS.map(group => (
					<div key={group.title} className={classes.group}>
						<span className={classes.groupTitle}>{group.title}</span>
						<ul className={classes.list}>
							{group.items.map(item => {
								const shortcutCombos = isMac ? item.mac : item.win

								return (
									<li key={item.label} className={classes.row}>
										<span className={classes.label}>{item.label}</span>
										<div className={classes.keys}>
											{shortcutCombos.map((combo, comboIdx) => (
												<div key={comboIdx} className={classes.comboGroup}>
													{comboIdx > 0 && <span className={classes.orText}>or</span>}
													{combo.map((key, keyIdx) => (
														<kbd key={keyIdx} className={classes.kbd}>
															{key}
														</kbd>
													))}
												</div>
											))}
										</div>
									</li>
								)
							})}
						</ul>
					</div>
				))}
			</div>
		</div>
	)
}
