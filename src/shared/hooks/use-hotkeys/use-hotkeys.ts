'use client'

import { useEffect } from 'react'

export interface HotkeyConfig {
	code: string
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
				if (isInputField && !config.allowInInputs) {
					continue
				}

				const matchAlt = config.alt ? e.altKey : !e.altKey
				const matchCtrl = config.ctrl ? e.ctrlKey : !e.ctrlKey
				const matchMeta = config.meta ? e.metaKey : !e.metaKey
				const matchShift = config.shift ? e.shiftKey : !e.shiftKey

				const matchKey =
					e.code.toLowerCase() === config.code.toLowerCase() || e.key.toLowerCase() === config.code.toLowerCase()

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
