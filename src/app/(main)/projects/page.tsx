'use client'

import { useProjects } from '@/shared/hooks/projects/use-projects'
import { Tabs } from '@/shared/tabs/tabs'
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
							<svg width='20' height='20' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M7.97209 14.2013C5.81186 12.4697 1.33136 8.21552 1.33136 5.0238C1.28596 4.12216 1.57465 3.23784 2.13447 2.56371C2.69428 1.88957 3.47979 1.48031 4.31969 1.42519C5.15958 1.48031 5.9451 1.88957 6.50491 2.56371C7.06472 3.23784 7.35341 4.12216 7.30801 5.0238H8.63616C8.59076 4.12216 8.87945 3.23784 9.43926 2.56371C9.99908 1.88957 10.7846 1.48031 11.6245 1.42519C12.4644 1.48031 13.2499 1.88957 13.8097 2.56371C14.3695 3.23784 14.6582 4.12216 14.6128 5.0238C14.6128 8.21694 10.1323 12.4697 7.97209 14.2013Z'
									fill='transparent'
								/>
								<path
									d='M11.6245 0C10.8767 0.0124811 10.1452 0.236477 9.50394 0.649368C8.86265 1.06226 8.33425 1.64942 7.97209 2.35157C7.60993 1.64942 7.08152 1.06226 6.44023 0.649368C5.79894 0.236477 5.06747 0.0124811 4.31969 0C3.12764 0.0555758 2.00453 0.615151 1.19575 1.55647C0.386956 2.4978 -0.0417764 3.74435 0.00321484 5.0238C0.00321484 9.85164 7.27879 15.4277 7.58825 15.6643L7.97209 15.9557L8.35592 15.6643C8.66538 15.4291 15.941 9.85164 15.941 5.0238C15.9859 3.74435 15.5572 2.4978 14.7484 1.55647C13.9396 0.615151 12.8165 0.0555758 11.6245 0ZM7.97209 14.2013C5.81186 12.4697 1.33136 8.21552 1.33136 5.0238C1.28596 4.12216 1.57465 3.23784 2.13447 2.56371C2.69428 1.88957 3.47979 1.48031 4.31969 1.42519C5.15958 1.48031 5.9451 1.88957 6.50491 2.56371C7.06472 3.23784 7.35341 4.12216 7.30801 5.0238H8.63616C8.59076 4.12216 8.87945 3.23784 9.43926 2.56371C9.99908 1.88957 10.7846 1.48031 11.6245 1.42519C12.4644 1.48031 13.2499 1.88957 13.8097 2.56371C14.3695 3.23784 14.6582 4.12216 14.6128 5.0238C14.6128 8.21694 10.1323 12.4697 7.97209 14.2013Z'
									fill='var(--text)'
								/>
							</svg>
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
