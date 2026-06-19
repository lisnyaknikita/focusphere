'use client'

import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { BackIcon } from '@/shared/ui/icons/projects/back-icon'
import { useRouter, useSearchParams } from 'next/navigation'
import { TeamInvitationForm } from './components/main/team-invitation-form/team-invitation-form'
import classes from './page.module.scss'

export default function TeamInvitationPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const projectId = searchParams.get('projectId')

	const handleBack = () => {
		if (projectId) {
			router.push(`/projects/new?projectId=${projectId}`)
		} else {
			router.push('/projects/new')
		}
	}

	return (
		<div className={classes.teamInvitationPage}>
			<header className={classes.header}>
				<ActionTooltip text='Back to previous step'>
					{(setRef, refProps) => (
						<button className={classes.backButton} ref={setRef} onClick={handleBack} {...refProps}>
							<BackIcon />
						</button>
					)}
				</ActionTooltip>
			</header>
			<main className={classes.teamInvitation}>
				<TeamInvitationForm />
			</main>
		</div>
	)
}
