'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { HotkeyConfig, useHotkeys } from '../use-hotkeys/use-hotkeys'

export const useGlobalHotkeys = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const toggleDrawerParam = useCallback(
		(drawerName: string) => {
			const params = new URLSearchParams(searchParams?.toString())
			const currentDrawer = params.get('drawer')

			if (currentDrawer === drawerName) {
				params.delete('drawer')
			} else {
				params.set('drawer', drawerName)
			}

			const queryString = params.toString()
			router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
		},
		[pathname, router, searchParams]
	)

	const setModalParam = useCallback(
		(modalName: string) => {
			const params = new URLSearchParams(searchParams?.toString())
			params.set('modal', modalName)
			router.push(`${pathname}?${params.toString()}`, { scroll: false })
		},
		[pathname, router, searchParams]
	)

	const shortcuts: HotkeyConfig[] = useMemo(
		() => [
			{
				key: 'i',
				meta: true,
				callback: () => toggleDrawerParam('quick-ideas'),
			},
			{
				key: 'i',
				ctrl: true,
				callback: () => toggleDrawerParam('quick-ideas'),
			},
			{ key: '1', alt: true, callback: () => router.push('/dashboard') },
			{ key: '2', alt: true, callback: () => router.push('/calendar') },
			{ key: '3', alt: true, callback: () => router.push('/planner') },
			{ key: '4', alt: true, callback: () => router.push('/projects') },
			{ key: '5', alt: true, callback: () => router.push('/focus') },
			{ key: '6', alt: true, callback: () => router.push('/journal') },
			{ key: '7', alt: true, callback: () => router.push('/notes') },
		],
		[router, pathname, searchParams, setModalParam]
	)

	useHotkeys(shortcuts)
}
