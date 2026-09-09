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
	onHideClick?: () => void
}

export const NavigationItem = ({ item, isCollapsed, isActive, onHideClick }: NavigationItemProps) => {
	const isMac = useIsMac()
	const icon = item.isButton
		? isCollapsed
			? item.showIconSvg || item.iconSvg
			: item.hideIconSvg || item.iconSvg
		: item.iconSvg

	const label = item.isButton && !isCollapsed ? 'Hide' : item.label
	const shortcutStr =
		typeof item.shortcut === 'object'
			? isMac
				? item.shortcut.mac
				: item.shortcut.win
			: item.shortcut
	const tooltipText = shortcutStr ? `${label} (${shortcutStr})` : label

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
				<ActionTooltip text={tooltipText} isActive={isCollapsed} placement='right' style={{ width: '100%' }}>
					{(setRef, refProps) => (
						<button ref={setRef} className={classes.navigationItemLink} onClick={onHideClick} {...refProps}>
							{content}
						</button>
					)}
				</ActionTooltip>
			</li>
		)
	}

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
