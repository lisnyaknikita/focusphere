'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import classes from './tabs.module.scss'

const tabs = [
	{ key: 'board', label: 'Board' },
	{ key: 'chat', label: 'Chat' },
	{ key: 'notes', label: 'Notes' },
]

export const ProjectTabs = ({ projectId }: { projectId: string }) => {
	const pathname = usePathname()

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
