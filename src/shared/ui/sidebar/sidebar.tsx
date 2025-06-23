'use client'

import clsx from 'clsx'
import { Logo } from './components/logo/logo'

import { useState } from 'react'
import { NavigationItem } from './components/navigation-item/navigation-item'
import { UserButton } from './components/user-button/user-button'
import { navItems } from './navigation-items'
import classes from './sidebar.module.scss'

export const Sidebar = () => {
	const [isCollapsed, setIsCollapsed] = useState(false)

	const onHideClick = () => {
		setIsCollapsed(prev => !prev)
	}

	return (
		<div className={clsx(classes.sidebar, isCollapsed && 'collapsed')}>
			<Logo isCollapsed={isCollapsed} />
			<nav className={classes.navigation}>
				<ul className={classes.navigationList}>
					{navItems.map(item => (
						<NavigationItem key={item.label} item={item} isCollapsed={isCollapsed} onHideClick={onHideClick} />
					))}
				</ul>
			</nav>
			<UserButton isCollapsed={isCollapsed} />
		</div>
	)
}
