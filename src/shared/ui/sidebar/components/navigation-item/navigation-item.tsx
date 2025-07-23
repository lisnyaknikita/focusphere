import { NavItem } from '@/shared/types/navigation'
import clsx from 'clsx'
import Link from 'next/link'
import classes from './navigation-item.module.scss'

type NavigationItemProps = {
	item: NavItem
	isCollapsed: boolean
	isActive: boolean
	onHideClick?: () => void
}

export const NavigationItem = ({ item, isCollapsed, isActive, onHideClick }: NavigationItemProps) => {
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
			<Link href={item.href || '#'} className={clsx(classes.navigationItemLink, isActive && classes.active)}>
				{content}
			</Link>
		</li>
	)
}
