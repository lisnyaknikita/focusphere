'use client'

import { useBilling } from '@/shared/context/billing-context'
import { useGeneralNotes } from '@/shared/hooks/notes/use-general-notes'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useRouter } from 'next/navigation'
import classes from './quick-access.module.scss'

export const QuickAccess = () => {
	const router = useRouter()
	const { user } = useUser()
	const { isPro, openPaywall } = useBilling()
	const { notes } = useGeneralNotes(user?.$id ?? '')

	const handleQuickIdeaClick = () => {
		if (!isPro && notes.length >= 6) {
			openPaywall('notes_unlimited')
			return
		}
		router.push('?modal=quick-idea')
	}

	return (
		<footer>
			<div className={classes.buttons}>
				<button className={classes.button} onClick={() => router.push('?modal=create-event')}>
					Create Event
				</button>
				<button className={classes.button} onClick={() => router.push('?modal=create-daily-task')}>
					Add Task for Today
				</button>
				<button className={classes.button} onClick={handleQuickIdeaClick}>
					Capture Idea
				</button>
			</div>
		</footer>
	)
}
