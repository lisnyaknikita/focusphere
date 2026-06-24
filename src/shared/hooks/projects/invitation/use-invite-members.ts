import { inviteMembersToTeam } from '@/lib/projects/invite-service/invite-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppwriteException } from 'appwrite'
import { useState } from 'react'
import { toast } from 'sonner'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formatEmail = (input: string): string => {
	const cleaned = input.trim().toLowerCase()
	if (!cleaned) return ''
	if (cleaned.includes('@')) return cleaned
	return `${cleaned.replace(/\s+/g, '')}@gmail.com`
}

export const useInviteMembers = (teamId: string, projectId: string) => {
	const queryClient = useQueryClient()
	const [inputValue, setInputValue] = useState('')
	const [members, setMembers] = useState<string[]>([])

	const { mutateAsync: inviteMutate, isPending } = useMutation({
		mutationFn: (emails: string[]) => inviteMembersToTeam(teamId, emails, projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['team-members', teamId] })
			queryClient.invalidateQueries({ queryKey: ['team-memberships', teamId] })
			setMembers([])
			setInputValue('')
		},
	})

	const addMember = () => {
		const email = formatEmail(inputValue)

		if (email && emailRegex.test(email) && !members.includes(email)) {
			setMembers(prev => [...prev, email])
			setInputValue('')
			return true
		}
		return false
	}

	const removeMember = (index: number) => {
		setMembers(prev => prev.filter((_, i) => i !== index))
	}

	const sendInvites = async () => {
		const finalMembers = [...members]
		const currentEmail = formatEmail(inputValue)

		if (currentEmail && emailRegex.test(currentEmail) && !finalMembers.includes(currentEmail)) {
			finalMembers.push(currentEmail)
		}

		if (finalMembers.length === 0) return

		try {
			await toast.promise(inviteMutate(finalMembers), {
				loading: 'Sending invitations...',
				success: 'Invitations sent successfully!',
				error: err =>
					err instanceof AppwriteException || err instanceof Error ? err.message : 'Failed to send invitations',
			})
		} catch (err) {
			console.error('Failed to send invites:', err)
		}
	}

	return {
		inputValue,
		setInputValue,
		members,
		isSending: isPending,
		formatEmail,
		addMember,
		removeMember,
		sendInvites,
	}
}
