'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import classes from './tabs.module.scss'

export const ProjectTabs = ({
	projectId,
	projectType,
}: {
	projectId: string
	projectType: 'team' | 'solo' | undefined
}) => {
	const pathname = usePathname()

	const tabs = [
		{ key: 'board', label: 'Board' },
		projectType === 'team' && { key: 'chat', label: 'Chat' },
		{ key: 'notes', label: 'Notes' },
	].filter(Boolean) as { key: string; label: string }[]

	return (
		<nav className={classes.tabs}>
			{tabs.map(({ key, label }) => (
				<Link
					key={key}
					href={`/projects/${projectId}/${key}`}
					className={`${classes.tab} ${pathname.endsWith(key) ? classes.active : ''}`}
				>
					{label}
				</Link>
			))}
		</nav>
	)
}
