'use client'

import { BackIcon } from '@/shared/ui/icons/projects/back-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import Link from 'next/link'
import { useState } from 'react'
import { NewProjectForm } from './components/main/new-project-form/new-project-form'
import classes from './page.module.scss'

export default function NewProjectPage() {
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'right',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	return (
		<div className={classes.newProjectPage}>
			<header className={classes.header}>
				<Link
					href={'/projects'}
					className={classes.backButton}
					ref={refs.setReference}
					{...getReferenceProps()}
					onMouseEnter={() => setIsTooltipOpen(true)}
					onMouseLeave={() => setIsTooltipOpen(false)}
				>
					<BackIcon />
					{isTooltipOpen && (
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
							Back to projects
						</div>
					)}
				</Link>
			</header>
			<main className={classes.newProject}>
				<NewProjectForm />
			</main>
		</div>
	)
}
