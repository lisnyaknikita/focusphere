'use client'

import { teams } from '@/lib/appwrite'
import { useProject } from '@/shared/context/project-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { KanbanBoard } from './components/kanban-board/kanban-board'
import { ProjectInfo } from './components/project-header/project-info'
import classes from './page.module.scss'

export default function BoardPage() {
	const { project, isLoading } = useProject()
	const searchParams = useSearchParams()
	const router = useRouter()
	const [isAccepting, setIsAccepting] = useState(!!searchParams.get('secret'))

	useEffect(() => {
		const secret = searchParams.get('secret')
		const userId = searchParams.get('userId')
		const membershipId = searchParams.get('membershipId')
		const teamId = searchParams.get('teamId')

		if (secret && userId && teamId && membershipId) {
			const acceptInvite = async () => {
				try {
					await teams.updateMembershipStatus(teamId, membershipId, userId, secret)

					const cleanUrl = window.location.pathname
					router.replace(cleanUrl)

					setIsAccepting(false)
				} catch (error) {
					console.error('Failed to accept invitation:', error)
					setIsAccepting(false)
				}
			}

			acceptInvite()
		}
	}, [searchParams, router])

	const showLoader = isAccepting || isLoading

	return (
		<div className={classes.boardPage}>
			{showLoader ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					{project && <ProjectInfo project={project} />}
					<KanbanBoard />
				</>
			)}
		</div>
	)
}
