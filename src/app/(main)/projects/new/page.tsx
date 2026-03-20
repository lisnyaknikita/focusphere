'use client'

import { BackIcon } from '@/shared/ui/icons/projects/back-icon'
import Link from 'next/link'
import { NewProjectForm } from './components/main/new-project-form/new-project-form'
import classes from './page.module.scss'

export default function NewProjectPage() {
	return (
		<div className={classes.newProjectPage}>
			<header className={classes.header}>
				<Link href={'/projects'} className={classes.backButton}>
					<BackIcon />
				</Link>
			</header>
			<main className={classes.newProject}>
				<NewProjectForm />
			</main>
		</div>
	)
}
