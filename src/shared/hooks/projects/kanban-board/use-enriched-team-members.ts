import { getTeamMembersWithNames } from '@/app/actions/get-team-members'
import { TeamMember } from '@/shared/types/chat'
import { useQuery } from '@tanstack/react-query'

export const useEnrichedTeamMembers = (teamId?: string) => {
	const { data: teammates = [], isLoading } = useQuery({
		queryKey: ['team-members', teamId],
		queryFn: async () => {
			if (!teamId) return [] as TeamMember[]
			return await getTeamMembersWithNames(teamId)
		},
		enabled: !!teamId,
		staleTime: 5 * 60 * 1000,
	})

	return { teammates, isLoading }
}
