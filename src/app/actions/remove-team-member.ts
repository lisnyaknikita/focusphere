'use server'

import { adminTeams } from '@/lib/appwrite-admin'

export async function removeTeamMember(teamId: string, membershipId: string): Promise<boolean> {
	if (!teamId || !membershipId) {
		throw new Error('teamId and membershipId are required')
	}

	await adminTeams.deleteMembership(teamId, membershipId)

	return true
}
