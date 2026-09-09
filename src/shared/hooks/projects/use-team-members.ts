import { getTeamMembers } from '@/lib/projects/chat/chat'
import { useQuery } from '@tanstack/react-query'

export const useTeamMembers = (teamId?: string, isTeam: boolean = true) => {
	return useQuery({
		queryKey: ['team-memberships', teamId],
		queryFn: () => getTeamMembers(teamId!),
		enabled: !!teamId && isTeam,
		staleTime: 1000 * 60 * 5,
		select: data => data.memberships,
	})
}
