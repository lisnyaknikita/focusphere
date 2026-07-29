'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { HotkeyConfig, useHotkeys } from '../use-hotkeys/use-hotkeys'

export const useGlobalHotkeys = () => {
	const router = useRouter()

	const shortcuts: HotkeyConfig[] = useMemo(
		() => [
			{
				code: 'KeyC',
				alt: true,
				callback: () => {
					const pathname = window.location.pathname
					const params = new URLSearchParams(window.location.search)

					params.set('modal', 'quick-idea')

					router.push(`${pathname}?${params.toString()}`, { scroll: false })
				},
			},
		],
		[router]
	)

	useHotkeys(shortcuts)
}
