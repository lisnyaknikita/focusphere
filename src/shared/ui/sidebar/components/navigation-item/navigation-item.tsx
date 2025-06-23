import Image from 'next/image'
import Link from 'next/link'

import { NavItem } from '@/shared/types/navigation'

import clsx from 'clsx'
import classes from './navigation-item.module.scss'

type NavigationItemProps = {
	item: NavItem
	isCollapsed: boolean
	onHideClick?: () => void
}

export const NavigationItem = ({ item, isCollapsed, onHideClick }: NavigationItemProps) => {
	const iconButtonSrc = item.isButton && !isCollapsed ? './hide.svg' : './show.svg'

	const content = (
		<>
			<Image
				src={item.isButton ? iconButtonSrc : item.iconSrc}
				alt={item.iconAlt}
				width={20}
				height={20}
				className={clsx(item.isButton && classes.hideIcon)}
			/>
			<span className={clsx(classes.label, isCollapsed && 'hidden')}>{item.label}</span>
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
			<Link href={item.href || '#'} className={classes.navigationItemLink}>
				{content}
			</Link>
		</li>
	)
}
