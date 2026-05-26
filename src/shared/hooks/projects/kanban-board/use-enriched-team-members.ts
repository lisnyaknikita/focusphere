import { getTeamMembersWithNames } from '@/app/actions/get-team-members'
import { TeamMember } from '@/shared/types/chat'
import { useEffect, useState } from 'react'

export const useEnrichedTeamMembers = (teamId?: string) => {
	const [teammates, setTeammates] = useState<TeamMember[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchEnrichedMembers = async () => {
			if (!teamId) {
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			try {
				const data = await getTeamMembersWithNames(teamId)
				setTeammates(data)
			} catch (err) {
				console.error('Failed to fetch enriched teammates:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchEnrichedMembers()
	}, [teamId])

	return { teammates, isLoading }
}
