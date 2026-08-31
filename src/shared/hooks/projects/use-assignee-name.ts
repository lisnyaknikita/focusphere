'use client'

import { useProject } from '@/shared/context/project-context'
import { useEnrichedTeamMembers } from '@/shared/hooks/projects/kanban-board/use-enriched-team-members'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useMemo } from 'react'

export const useAssigneeName = (userId?: string, fallbackName?: string) => {
	const { user } = useUser()

	let teamId: string | undefined
	try {
		const projectContext = useProject()
		teamId = projectContext?.project?.teamId
	} catch {
		teamId = undefined
	}

	const { teammates } = useEnrichedTeamMembers(teamId)

	const assigneeName = useMemo(() => {
		if (!userId) return fallbackName || 'Unassigned'
		if (user && user.$id === userId && user.name) return user.name

		const foundMember = teammates.find(m => m.userId === userId)
		if (foundMember?.userName) return foundMember.userName

		return fallbackName || 'Unassigned'
	}, [userId, fallbackName, user, teammates])

	return assigneeName
}
