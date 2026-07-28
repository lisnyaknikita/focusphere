'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { HotkeyConfig, useHotkeys } from '../use-hotkeys/use-hotkeys'

export const useGlobalHotkeys = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const shortcuts: HotkeyConfig[] = useMemo(
		() => [
			{
				code: 'KeyC',
				alt: true,
				callback: () => {
					const params = new URLSearchParams(searchParams.toString())
					params.set('modal', 'quick-idea')

					router.push(`${pathname}?${params.toString()}`, { scroll: false })
				},
			},
		],
		[pathname, searchParams, router]
	)

	useHotkeys(shortcuts)
}
