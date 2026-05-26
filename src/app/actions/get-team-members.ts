'use server'

import { adminTeams, adminUsers } from '@/lib/appwrite-admin'
import { TeamMember } from '@/shared/types/chat'

export async function getTeamMembersWithNames(teamId: string): Promise<TeamMember[]> {
	const memberships = await adminTeams.listMemberships(teamId)

	const enriched = await Promise.all(
		memberships.memberships.map(async m => {
			let userName = m.userName
			let userEmail = m.userEmail

			if (!userName) {
				try {
					const user = await adminUsers.get(m.userId)
					userName = user.name
					userEmail = user.email
				} catch {
					userName = 'Unknown'
					userEmail = ''
				}
			}

			return {
				$id: m.$id,
				userId: m.userId,
				userName,
				userEmail,
				roles: m.roles,
			}
		})
	)

	return enriched
}
