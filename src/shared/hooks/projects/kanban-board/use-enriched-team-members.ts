import { getTeamMembersWithNames } from '@/app/actions/get-team-members'
import { TeamMember } from '@/shared/types/chat'
import { useQuery } from '@tanstack/react-query'

export const useEnrichedTeamMembers = (teamId?: string) => {
	const { data, isLoading } = useQuery({
		queryKey: ['team-members', teamId],
		queryFn: async () => {
			if (!teamId) return [] as TeamMember[]

			const result = await getTeamMembersWithNames(teamId)

			if (result && typeof result === 'object' && !Array.isArray(result)) {
				throw new Error('Backend returned an error object instead of array')
			}

			return Array.isArray(result) ? result : ([] as TeamMember[])
		},
		enabled: !!teamId,
		staleTime: 1 * 60 * 1000,
	})

	const teammates = Array.isArray(data) ? data : []

	return { teammates, isLoading }
}
