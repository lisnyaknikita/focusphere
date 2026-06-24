import { inviteMembersToTeam } from '@/lib/projects/invite-service/invite-service'
import { getProjectById } from '@/lib/projects/projects'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppwriteException } from 'appwrite'
import { toast } from 'sonner'

export const useTeamInvitation = (projectId: string | null) => {
	const queryClient = useQueryClient()

	const { data: project, isLoading: isProjectLoading } = useQuery({
		queryKey: ['project', projectId],
		queryFn: () => getProjectById(projectId!),
		enabled: !!projectId,
		staleTime: 0,
	})

	const teamId = project?.teamId ?? null

	const { mutateAsync: inviteMutate, isPending: isSending } = useMutation({
		mutationFn: (emails: string[]) => inviteMembersToTeam(teamId!, emails, projectId!),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['team-members', teamId] })
			queryClient.invalidateQueries({ queryKey: ['team-memberships', teamId] })
		},
	})

	const sendInvitations = async (emails: string[]) => {
		if (!teamId) return

		const promise = inviteMutate(emails)

		toast.promise(promise, {
			loading: 'Sending invitations...',
			success: 'Invitations sent!',
			error: err => (err instanceof AppwriteException || err instanceof Error ? err.message : 'Invitation failed'),
		})

		return promise
	}

	return {
		teamId,
		isProjectLoading,
		isSending,
		sendInvitations,
	}
}
