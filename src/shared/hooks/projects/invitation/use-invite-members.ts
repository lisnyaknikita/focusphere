import { inviteMembersToTeam } from '@/lib/projects/invite-service/invite-service'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export const useInviteMembers = (teamId: string, projectId: string) => {
	const [inputValue, setInputValue] = useState('')
	const [members, setMembers] = useState<string[]>([])
	const [isSending, setIsSending] = useState(false)

	const formatEmail = useCallback((input: string) => {
		const cleaned = input.trim().toLowerCase()
		if (!cleaned) return ''
		if (cleaned.includes('@')) return cleaned
		return `${cleaned.replace(/\s+/g, '')}@gmail.com`
	}, [])

	const addMember = useCallback(() => {
		const email = formatEmail(inputValue)
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (email && emailRegex.test(email) && !members.includes(email)) {
			setMembers(prev => [...prev, email])
			setInputValue('')
			return true
		}
		return false
	}, [inputValue, members, formatEmail])

	const removeMember = (index: number) => {
		setMembers(prev => prev.filter((_, i) => i !== index))
	}

	const sendInvites = async () => {
		const finalMembers = [...members]
		const currentEmail = formatEmail(inputValue)

		if (currentEmail && !finalMembers.includes(currentEmail)) {
			finalMembers.push(currentEmail)
		}

		if (finalMembers.length === 0) return

		setIsSending(true)

		const promise = inviteMembersToTeam(teamId, finalMembers, projectId)

		toast.promise(promise, {
			loading: 'Sending invitations...',
			success: () => {
				setMembers([])
				setInputValue('')
				return 'Invitations sent successfully!'
			},
			error: 'Failed to send invitations',
			finally: () => setIsSending(false),
		})
	}

	return {
		inputValue,
		setInputValue,
		members,
		isSending,
		formatEmail,
		addMember,
		removeMember,
		sendInvites,
	}
}
