'use client'

import clsx from 'clsx'
import { Logo } from './components/logo/logo'

import { useFocusModeStore } from '@/shared/stores/focus-mode.store'
import { useSidebarStore } from '@/shared/stores/sidebar.store'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { ChevronLeftIcon } from '@/shared/ui/icons/focus/chevron-left-icon'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { MenuIcon } from '../icons/menu-icon'
import { NavigationItem } from './components/navigation-item/navigation-item'
import { UserButton } from './components/user-button/user-button'
import { navItems } from './navigation-items'
import classes from './sidebar.module.scss'

export const Sidebar = () => {
	const isCollapsed = useSidebarStore(s => s.isCollapsed)
	const isMobileOpen = useSidebarStore(s => s.isMobileOpen)
	const toggleSidebar = useSidebarStore(s => s.toggleSidebar)
	const setIsMobileOpen = useSidebarStore(s => s.setIsMobileOpen)

	const pathname = usePathname()
	const focusModes = useFocusModeStore(s => s.focusModes)
	const setFocusMode = useFocusModeStore(s => s.setFocusMode)
	const [hasHydrated, setHasHydrated] = useState(false)

	useEffect(() => {
		setHasHydrated(true)
	}, [])

	const isProjectNotesPage = useMemo(() => {
		return pathname.startsWith('/projects/') && pathname.includes('/notes')
	}, [pathname])

	useEffect(() => {
		if (!hasHydrated) return

		if (focusModes.generalNotes && !pathname.startsWith('/notes')) {
			setFocusMode('generalNotes', false)
		}
		if (focusModes.journal && !pathname.startsWith('/journal')) {
			setFocusMode('journal', false)
		}
		if (focusModes.projectNotes && !isProjectNotesPage) {
			setFocusMode('projectNotes', false)
		}
	}, [pathname, focusModes, setFocusMode, hasHydrated, isProjectNotesPage])

	const isFocusModeActiveOnCurrentPage = useMemo(() => {
		if (!hasHydrated) return false

		if (pathname.startsWith('/notes') && focusModes.generalNotes) return true
		if (pathname.startsWith('/journal') && focusModes.journal) return true
		if (isProjectNotesPage && focusModes.projectNotes) return true

		return false
	}, [pathname, focusModes, hasHydrated, isProjectNotesPage])

	useEffect(() => {
		setIsMobileOpen(false)
	}, [pathname, setIsMobileOpen])

	useEffect(() => {
		if (isMobileOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isMobileOpen])

	return (
		<>
			{!isFocusModeActiveOnCurrentPage && (
				<button className={classes.mobileToggle} onClick={() => setIsMobileOpen(true)} aria-label='Open menu'>
					<MenuIcon />
				</button>
			)}
			<div
				className={clsx(classes.mobileOverlay, isMobileOpen && classes.mobileOpen)}
				onClick={() => setIsMobileOpen(false)}
			/>
			<aside
				className={clsx(
					classes.sidebar,
					isCollapsed && 'collapsed',
					isMobileOpen && classes.mobileOpen,
					isFocusModeActiveOnCurrentPage && classes.focusModeActive
				)}
			>
				<div className={classes.topSection}>
					<div className={classes.header}>
						<Logo isCollapsed={isCollapsed} />
					</div>
					<nav className={classes.navigation}>
						<ul className={classes.navigationList}>
							{navItems.map(item => (
								<NavigationItem
									key={item.label}
									item={item}
									isCollapsed={isCollapsed}
									isActive={item.href === pathname || pathname.startsWith(`${item.href}/`)}
								/>
							))}
						</ul>
					</nav>
				</div>
				<div className={classes.bottomSection}>
					<UserButton isCollapsed={isCollapsed} />
				</div>
				<ActionTooltip text={isCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'} placement='right'>
					{(setRef, refProps) => (
						<button
							ref={setRef}
							type='button'
							className={classes.toggleButton}
							onClick={toggleSidebar}
							aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
							{...refProps}
						>
							<ChevronLeftIcon
								width={14}
								height={14}
								className={clsx(classes.toggleIcon, isCollapsed && classes.toggleIconRotated)}
							/>
						</button>
					)}
				</ActionTooltip>
			</aside>
		</>
	)
}
