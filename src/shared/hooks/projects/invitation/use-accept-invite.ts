import { teams } from '@/lib/appwrite'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAcceptInvite = () => {
	const searchParams = useSearchParams()
	const [isAccepting, setIsAccepting] = useState(!!searchParams.get('secret'))

	useEffect(() => {
		const secret = searchParams.get('secret')
		const userId = searchParams.get('userId')
		const membershipId = searchParams.get('membershipId')
		const teamId = searchParams.get('teamId')

		if (secret && userId && teamId && membershipId) {
			const acceptInvite = async () => {
				try {
					await teams.updateMembershipStatus(teamId, membershipId, userId, secret)
					await new Promise(resolve => setTimeout(resolve, 800))
					window.location.href = window.location.pathname

					setIsAccepting(false)
				} catch (error) {
					console.error('Failed to accept invitation:', error)
					setIsAccepting(false)
				}
			}

			acceptInvite()
		}
	}, [searchParams])

	return { isAccepting }
}
