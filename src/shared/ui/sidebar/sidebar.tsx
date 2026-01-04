'use client'

import clsx from 'clsx'
import { Logo } from './components/logo/logo'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavigationItem } from './components/navigation-item/navigation-item'
import { UserButton } from './components/user-button/user-button'
import { navItems } from './navigation-items'
import classes from './sidebar.module.scss'

export const Sidebar = () => {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('sidebar-collapsed')
			return saved === 'true'
		}
		return false
	})

	const pathname = usePathname()

	useEffect(() => {
		const savedState = localStorage.getItem('sidebar-collapsed')
		if (savedState !== null) {
			setIsCollapsed(savedState === 'true')
		}
	}, [])

	useEffect(() => {
		localStorage.setItem('sidebar-collapsed', String(isCollapsed))
	}, [isCollapsed])

	const onHideClick = () => {
		setIsCollapsed(prev => !prev)
	}

	return (
		<div className={clsx(classes.sidebar, isCollapsed && 'collapsed')}>
			<Logo isCollapsed={isCollapsed} />
			<nav className={classes.navigation}>
				<ul className={classes.navigationList}>
					{navItems.map(item => (
						<NavigationItem
							key={item.label}
							item={item}
							isCollapsed={isCollapsed}
							isActive={(!item.isButton && item.href === pathname) || pathname.startsWith(`${item.href}/`)}
							onHideClick={onHideClick}
						/>
					))}
				</ul>
			</nav>
			<UserButton isCollapsed={isCollapsed} />
		</div>
	)
}
