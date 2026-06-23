'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useProjects } from '@/shared/hooks/projects/use-projects'
import { ProjectsView } from '@/shared/types/project'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { FavoriteIcon } from '@/shared/ui/icons/projects/favorite-icon'
import { Tabs } from '@/shared/ui/tabs/tabs'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { Pagination } from './components/footer/pagination/pagination'
import { CreateButton } from './components/header/create-button/create-button'
import { Search } from './components/header/search/search'
import { ProjectsList } from './components/main/projects-list/projects-list'
import classes from './page.module.scss'

const VIEW_KEY = 'projectsView'

export default function Projects() {
	const [view, setView] = useState<ProjectsView | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [favoritesOnly, setFavoritesOnly] = useState(false)

	const { isPro, isBillingLoading, openPaywall } = useBilling()

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery)
		}, 400)

		return () => clearTimeout(handler)
	}, [searchQuery])

	const { projects, total, limit, isLoading, isFetching } = useProjects(
		view,
		debouncedSearch,
		currentPage,
		favoritesOnly
	)

	useEffect(() => {
		if (isBillingLoading) return

		const saved = localStorage.getItem(VIEW_KEY) as ProjectsView | null

		if (saved === 'team' && !isPro) {
			setView('solo')
		} else {
			setView(saved ?? 'solo')
		}
	}, [isPro, isBillingLoading])

	useEffect(() => {
		if (view) localStorage.setItem(VIEW_KEY, view)
	}, [view])

	useEffect(() => {
		setCurrentPage(1)
	}, [view, searchQuery, favoritesOnly])

	const handleTabChange = (newView: ProjectsView) => {
		if (!isPro && newView === 'team') {
			openPaywall('projects_team')
			return
		}
		setView(newView)
	}

	const handleCreateClickCapture = (e: React.MouseEvent) => {
		if (!isPro && total >= 2) {
			e.stopPropagation()
			e.preventDefault()
			openPaywall('projects_unlimited')
		}
	}

	return (
		<div className={classes.projectsPage}>
			{isBillingLoading || !view ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					<header className={classes.header}>
						<Tabs
							tabs={['solo', 'team']}
							activeTab={view}
							onChange={handleTabChange}
							lockedTabs={!isBillingLoading && !isPro ? ['team'] : []}
						/>
						<Search value={searchQuery} onChange={setSearchQuery} />
						<ActionTooltip text={favoritesOnly ? 'Show all projects' : 'Show favorites only'}>
							{(setRef, refProps) => (
								<button
									ref={setRef}
									className={clsx(classes.favoriteButton, favoritesOnly && 'active')}
									onClick={() => setFavoritesOnly(!favoritesOnly)}
									{...refProps}
								>
									<FavoriteIcon />
								</button>
							)}
						</ActionTooltip>
						<div onClickCapture={handleCreateClickCapture}>
							<CreateButton />
						</div>
					</header>
					<main className={classes.projects}>
						<ProjectsList projects={projects} isLoading={isLoading} isFetching={isFetching} />
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
