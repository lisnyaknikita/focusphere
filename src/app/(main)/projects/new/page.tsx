'use client'

import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { BackIcon } from '@/shared/ui/icons/projects/back-icon'
import Link from 'next/link'
import { NewProjectForm } from './components/main/new-project-form/new-project-form'
import classes from './page.module.scss'

export default function NewProjectPage() {
	return (
		<div className={classes.newProjectPage}>
			<header className={classes.header}>
				<ActionTooltip text='Back to projects'>
					{(setRef, refProps) => (
						<Link href={'/projects'} className={classes.backButton} ref={setRef} {...refProps}>
							<BackIcon />
						</Link>
					)}
				</ActionTooltip>
			</header>
			<main className={classes.newProject}>
				<NewProjectForm />
			</main>
		</div>
	)
}
