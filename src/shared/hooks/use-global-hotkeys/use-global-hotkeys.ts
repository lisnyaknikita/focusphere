'use client'

import { useSidebarStore } from '@/shared/stores/sidebar.store'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { HotkeyConfig, useHotkeys } from '../use-hotkeys/use-hotkeys'

export const useGlobalHotkeys = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const toggleQueryParam = useCallback(
		(paramKey: 'modal' | 'drawer', paramValue: string) => {
			const params = new URLSearchParams(searchParams?.toString())
			const currentValue = params.get(paramKey)

			if (currentValue === paramValue) {
				params.delete(paramKey)
			} else {
				params.set(paramKey, paramValue)
			}

			const queryString = params.toString()
			router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
		},
		[pathname, router, searchParams]
	)

	const shortcuts: HotkeyConfig[] = useMemo(
		() => [
			{
				key: 'e',
				alt: true,
				callback: () => toggleQueryParam('modal', 'create-event'),
			},
			{
				key: 't',
				alt: true,
				callback: () => toggleQueryParam('modal', 'create-daily-task'),
			},
			{
				key: 'i',
				meta: true,
				callback: () => toggleQueryParam('drawer', 'quick-ideas'),
			},
			{
				key: 'i',
				ctrl: true,
				callback: () => toggleQueryParam('drawer', 'quick-ideas'),
			},
			{
				key: '?',
				shift: true,
				callback: () => toggleQueryParam('modal', 'shortcuts'),
			},
			{
				key: 'b',
				meta: true,
				callback: () => useSidebarStore.getState().toggleSidebar(),
			},
			{
				key: 'b',
				ctrl: true,
				callback: () => useSidebarStore.getState().toggleSidebar(),
			},

			{ key: '1', alt: true, callback: () => router.push('/dashboard') },
			{ key: '2', alt: true, callback: () => router.push('/calendar') },
			{ key: '3', alt: true, callback: () => router.push('/planner') },
			{ key: '4', alt: true, callback: () => router.push('/projects') },
			{ key: '5', alt: true, callback: () => router.push('/focus') },
			{ key: '6', alt: true, callback: () => router.push('/journal') },
			{ key: '7', alt: true, callback: () => router.push('/notes') },
		],
		[router, pathname, searchParams, toggleQueryParam]
	)

	useHotkeys(shortcuts)
}
