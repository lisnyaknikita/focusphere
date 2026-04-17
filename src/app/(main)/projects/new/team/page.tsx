'use client'

import { BackIcon } from '@/shared/ui/icons/projects/back-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { TeamInvitationForm } from './components/main/team-invitation-form/team-invitation-form'
import classes from './page.module.scss'

export default function TeamInvitationPage() {
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)
	const router = useRouter()
	const searchParams = useSearchParams()

	const projectId = searchParams.get('projectId')

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'right',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

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
				<button
					className={classes.backButton}
					ref={refs.setReference}
					onClick={handleBack}
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
							Back to previous step
						</div>
					)}
				</button>
			</header>
			<main className={classes.teamInvitation}>
				<TeamInvitationForm />
			</main>
		</div>
	)
}
