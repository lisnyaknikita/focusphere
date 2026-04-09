// use-team-invitation.ts
import { inviteMembersToTeam } from '@/lib/projects/invite-service/invite-service'
import { getProjectById } from '@/lib/projects/projects'
import { TeamInvitationValues } from '@/shared/schemas/team-invitation-schema'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useTeamInvitation = () => {
	const searchParams = useSearchParams()
	const projectId = searchParams.get('projectId')
	const router = useRouter()

	const [teamId, setTeamId] = useState<string | null>(null)
	const [fetchError, setFetchError] = useState<string | null>(null)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const redirectToBoard = () => {
		if (projectId) router.push(`/projects/${projectId}/board`)
	}

	useEffect(() => {
		if (!projectId) return

		let cancelled = false

		getProjectById(projectId)
			.then(project => {
				if (!cancelled && project.teamId) setTeamId(project.teamId)
			})
			.catch(() => {
				if (!cancelled) setFetchError('Failed to load project. Please try again.')
			})

		return () => {
			cancelled = true
		}
	}, [projectId])

	const generateEmail = (input: string): string => {
		const cleaned = input.trim().toLowerCase()
		if (!cleaned) return ''
		if (cleaned.includes('@')) return cleaned
		return cleaned.replace(/\s+/g, '') + '@gmail.com'
	}

	const isValidEmail = (email: string) => email.includes('.') && email.includes('@')

	const onSubmit = async (data: TeamInvitationValues, currentInput: string) => {
		if (!projectId || !teamId) return

		setSubmitError(null)

		const fromFields = data.members.map(m => m.email)
		const fromInput = generateEmail(currentInput)

		const all = fromInput && !fromFields.includes(fromInput) ? [...fromFields, fromInput] : fromFields

		const unique = [...new Set(all.map(e => e.trim()).filter(Boolean))]

		if (unique.length === 0) {
			redirectToBoard()
			return
		}

		try {
			await inviteMembersToTeam(teamId, unique, projectId)
			redirectToBoard()
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
		}
	}

	return {
		teamId,
		projectId,
		fetchError,
		submitError,
		generateEmail,
		isValidEmail,
		redirectToBoard,
		onSubmit,
	}
}
