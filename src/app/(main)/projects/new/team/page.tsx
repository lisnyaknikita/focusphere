import { BackIcon } from '@/shared/ui/icons/projects/back-icon'
import Link from 'next/link'
import { TeamInvitationForm } from './components/main/team-invitation-form/team-invitation-form'
import classes from './page.module.scss'

export default function TeamInvitationPage() {
	return (
		<div className={classes.teamInvitationPage}>
			<header className={classes.header}>
				<Link href={'/projects'} className={classes.backButton}>
					<BackIcon />
				</Link>
			</header>
			<main className={classes.teamInvitation}>
				<TeamInvitationForm />
			</main>
		</div>
	)
}
