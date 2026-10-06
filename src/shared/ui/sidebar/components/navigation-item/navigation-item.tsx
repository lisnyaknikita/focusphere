import { useIsMac } from '@/shared/hooks/use-is-mac/use-is-mac'
import { NavItem } from '@/shared/types/navigation'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import clsx from 'clsx'
import Link from 'next/link'
import classes from './navigation-item.module.scss'

type NavigationItemProps = {
	item: NavItem
	isCollapsed: boolean
	isActive: boolean
}

export const NavigationItem = ({ item, isCollapsed, isActive }: NavigationItemProps) => {
	const isMac = useIsMac()
	const icon = item.iconSvg
	const label = item.label
	const shortcutStr =
		typeof item.shortcut === 'object' ? (isMac ? item.shortcut.mac : item.shortcut.win) : item.shortcut
	const tooltipText = shortcutStr ? `${label} (${shortcutStr})` : label

	const content = (
		<>
			<span className={classes.icon}>{icon}</span>
			<span className={clsx(classes.label, isCollapsed && 'hidden')}>{label}</span>
		</>
	)

	return (
		<li className={classes.navigationItem}>
			<ActionTooltip text={tooltipText} isActive={isCollapsed} placement='right' style={{ width: '100%' }}>
				{(setRef, refProps) => (
					<Link
						ref={setRef}
						href={item.href || '#'}
						className={clsx(classes.navigationItemLink, isActive && classes.active)}
						{...refProps}
					>
						{content}
					</Link>
				)}
			</ActionTooltip>
		</li>
	)
}
