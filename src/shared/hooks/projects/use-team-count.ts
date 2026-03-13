import { getTeamMembersCount } from '@/lib/projects/projects'
import { useEffect, useState } from 'react'

export const useTeamCount = (teamId?: string, projectType?: string) => {
	const [count, setCount] = useState(1)

	useEffect(() => {
		if (projectType === 'solo' || !teamId) {
			setCount(1)
			return
		}

		getTeamMembersCount(teamId).then(setCount)
	}, [teamId, projectType])

	return count
}
