import { getTeamMembers } from '@/lib/projects/chat/chat'
import { useQuery } from '@tanstack/react-query'

export const useTeamMembers = (teamId?: string) => {
	return useQuery({
		queryKey: ['team-members', teamId],
		queryFn: () => getTeamMembers(teamId!),
		enabled: !!teamId,
		staleTime: 1000 * 60 * 5,
		select: data => data.memberships,
	})
}
