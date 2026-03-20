'use client'

import { useProjects } from '@/shared/hooks/projects/use-projects'
import { Tabs } from '@/shared/tabs/tabs'
import { FavoriteIcon } from '@/shared/ui/icons/projects/favorite-icon'
import clsx from 'clsx'
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
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [favoritesOnly, setFavoritesOnly] = useState(false)

	const { projects, total, limit, isLoading, refreshProjects } = useProjects(
		view ?? 'solo',
		searchQuery,
		currentPage,
		favoritesOnly
	)

	useEffect(() => {
		const saved = localStorage.getItem(VIEW_KEY) as ProjectsView | null
		setView(saved ?? 'team')
	}, [])

	useEffect(() => {
		if (view) localStorage.setItem(VIEW_KEY, view)
	}, [view])

	useEffect(() => {
		setCurrentPage(1)
	}, [view, searchQuery, favoritesOnly])

	return (
		<div className={classes.projectsPage}>
			{!view ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					<header className={classes.header}>
						<Tabs tabs={['solo', 'team']} activeTab={view} onChange={setView} />
						<Search value={searchQuery} onChange={setSearchQuery} />
						<button
							className={clsx(classes.favoriteButton, favoritesOnly && 'active')}
							onClick={() => setFavoritesOnly(!favoritesOnly)}
						>
							<FavoriteIcon />
						</button>
						<CreateButton />
					</header>
					<main className={classes.projects}>
						<ProjectsList projects={projects} isLoading={isLoading} onRefresh={refreshProjects} />
					</main>
					<footer className={classes.pagination}>
						{total > limit && (
							<Pagination currentPage={currentPage} total={total} limit={limit} onChange={setCurrentPage} />
						)}
					</footer>
				</>
			)}
		</div>
	)
}
