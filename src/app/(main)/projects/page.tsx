'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useProjects } from '@/shared/hooks/projects/use-projects'
import { Tabs } from '@/shared/tabs/tabs'
import { FavoriteIcon } from '@/shared/ui/icons/projects/favorite-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
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
	const [isFavTooltipOpen, setIsFavTooltipOpen] = useState(false)

	const { isPro, isBillingLoading, openPaywall } = useBilling()

	const { refs, floatingStyles, context } = useFloating({
		open: isFavTooltipOpen,
		onOpenChange: setIsFavTooltipOpen,
		placement: 'bottom',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const { projects, total, limit, isLoading } = useProjects(view, searchQuery, currentPage, favoritesOnly)

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
						<button
							ref={refs.setReference}
							className={clsx(classes.favoriteButton, favoritesOnly && 'active')}
							onClick={() => setFavoritesOnly(!favoritesOnly)}
							{...getReferenceProps()}
							onMouseEnter={() => setIsFavTooltipOpen(true)}
							onMouseLeave={() => setIsFavTooltipOpen(false)}
						>
							<FavoriteIcon />
							{isFavTooltipOpen && (
								<div
									ref={refs.setFloating}
									style={{
										...floatingStyles,
										background: 'var(--save-button-bg)',
										color: 'var(--save-button-text)',
										padding: '4px 8px',
										borderRadius: '5px',
										fontSize: '13px',
										fontWeight: 700,
										zIndex: 1000,
										whiteSpace: 'nowrap',
									}}
									{...getFloatingProps()}
								>
									{favoritesOnly ? 'Show all projects' : 'Show favorites only'}
								</div>
							)}
						</button>
						<div onClickCapture={handleCreateClickCapture}>
							<CreateButton />
						</div>
					</header>
					<main className={classes.projects}>
						<ProjectsList projects={projects} isLoading={isLoading} />
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
