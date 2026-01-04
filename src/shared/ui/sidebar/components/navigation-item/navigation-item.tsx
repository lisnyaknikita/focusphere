import { NavItem } from '@/shared/types/navigation'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import classes from './navigation-item.module.scss'

type NavigationItemProps = {
	item: NavItem
	isCollapsed: boolean
	isActive: boolean
	onHideClick?: () => void
}

export const NavigationItem = ({ item, isCollapsed, isActive, onHideClick }: NavigationItemProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const { refs, floatingStyles } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		middleware: [offset(10), flip(), shift()],
		whileElementsMounted: autoUpdate,
		placement: 'right',
	})

	const icon = item.isButton
		? isCollapsed
			? item.showIconSvg || item.iconSvg
			: item.hideIconSvg || item.iconSvg
		: item.iconSvg

	const label = item.isButton && !isCollapsed ? 'Hide' : item.label

	const content = (
		<>
			<span className={clsx(classes.icon, item.isButton && classes.hideIcon)}>{icon}</span>
			{(!item.isButton || !isCollapsed) && (
				<span className={clsx(classes.label, isCollapsed && 'hidden')}>{label}</span>
			)}
		</>
	)

	if (item.isButton) {
		return (
			<li className={classes.navigationItem}>
				<button className={classes.navigationItemLink} onClick={onHideClick}>
					{content}
				</button>
			</li>
		)
	}

	return (
		<li className={classes.navigationItem}>
			<Link
				href={item.href || '#'}
				className={clsx(classes.navigationItemLink, isActive && classes.active)}
				ref={refs.setReference}
				onMouseEnter={() => isCollapsed && !item.isButton && setIsOpen(true)}
				onMouseLeave={() => setIsOpen(false)}
			>
				{content}
				{isOpen && isCollapsed && !item.isButton && (
					<div
						ref={refs.setFloating}
						style={{
							...floatingStyles,
							background: 'var(--save-button-bg)',
							color: 'var(--save-button-text)',
							padding: '4px 8px',
							borderRadius: '5px',
							fontSize: '14px',
							zIndex: 1000,
						}}
						role='tooltip'
					>
						{label}
					</div>
				)}
			</Link>
		</li>
	)
}
