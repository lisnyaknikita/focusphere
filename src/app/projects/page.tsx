'use client'

import { Tabs } from '@/shared/tabs/tabs'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { Pagination } from './components/footer/pagination/pagination'
import { CreateButton } from './components/header/create-button/create-button'
import { Search } from './components/header/search/search'
import { ProjectsList } from './components/main/projects-list/projects-list'
import classes from './page.module.scss'

type ProjectsView = 'solo' | 'team'

const VIEW_KEY = 'projectsView'

export default function Projects() {
	const [view, setView] = useState<ProjectsView | null>(null)

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as ProjectsView | null
		setView(saved ?? 'team')
	}, [])

	useEffect(() => {
		if (view) localStorage.setItem(VIEW_KEY, view)
	}, [view])

	return (
		<div className={classes.projectsPage}>
			{!view ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					<header className={classes.header}>
						<Tabs tabs={['solo', 'team']} activeTab={view} onChange={setView} />
						<Search />
						<CreateButton />
					</header>
					<main className={classes.projects}>
						<ProjectsList />
					</main>
					<footer className={classes.pagination}>
						<Pagination />
					</footer>
				</>
			)}
		</div>
	)
}
