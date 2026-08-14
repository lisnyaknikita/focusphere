'use client'

import { useEffect } from 'react'

export interface HotkeyConfig {
	key: string
	alt?: boolean
	ctrl?: boolean
	meta?: boolean
	shift?: boolean
	allowInInputs?: boolean
	callback: (e: KeyboardEvent) => void
}

export const useHotkeys = (hotkeys: HotkeyConfig[]) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

			for (const config of hotkeys) {
				if (isInputField && !config.allowInInputs) continue

				const matchAlt = !!config.alt === e.altKey
				const matchCtrl = !!config.ctrl === e.ctrlKey
				const matchMeta = !!config.meta === e.metaKey
				const matchShift = !!config.shift === e.shiftKey

				const targetKey = config.key.toLowerCase()
				const currentKey = e.key.toLowerCase()
				const currentCode = e.code.toLowerCase()

				const matchKey =
					currentKey === targetKey || currentCode === `digit${targetKey}` || currentCode === `key${targetKey}`

				if (matchAlt && matchCtrl && matchMeta && matchShift && matchKey) {
					e.preventDefault()
					config.callback(e)
					break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [hotkeys])
}
