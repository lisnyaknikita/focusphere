import { teams } from '@/lib/appwrite'

export const inviteMembersToTeam = async (teamId: string, emails: string[], projectId: string) => {
	const redirectUrl = `${window.location.origin}/projects/${projectId}/board`

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	const validEmails = emails.map(e => e.trim()).filter(e => emailRegex.test(e))

	if (validEmails.length === 0) return []

	const promises = validEmails.map(email => {
		const defaultName = email.split('@')[0]

		return teams.createMembership(teamId, ['member'], email, undefined, undefined, redirectUrl, defaultName)
	})

	return await Promise.all(promises)
}
