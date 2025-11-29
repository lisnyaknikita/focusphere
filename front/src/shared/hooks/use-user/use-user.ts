import { account } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { ensureDefaultAvatar } from '@/shared/utils/ensure-default-avatar/ensure-default-avatar'
import { AppwriteException } from 'appwrite'
import { useEffect, useState } from 'react'

export const useUser = () => {
	const [user, setUser] = useState<CustomUser | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const getUser = async () => {
			try {
				let currentUser = (await account.get()) as CustomUser

				if (!currentUser.prefs?.avatarId) {
					const avatarId = await ensureDefaultAvatar()

					currentUser = {
						...currentUser,
						prefs: {
							...currentUser.prefs,
							avatarId: avatarId,
						},
					}
				}

				setUser(currentUser)
			} catch (error: unknown) {
				if (error instanceof AppwriteException) {
					console.log('Appwrite Error during user retrieval:', error.message)
				} else if (error instanceof Error) {
					console.error('General Error during user retrieval:', error.message)
				} else {
					console.error('An unexpected error occurred.')
				}

				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		getUser()
	}, [])

	const updateUserData = (updatedFields: Partial<CustomUser>) => {
		setUser(current => {
			if (!current) return null
			return { ...current, ...updatedFields }
		})
	}

	const logout = async () => {
		try {
			await account.deleteSession({ sessionId: 'current' })
			setUser(null)
			window.location.href = '/login'
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return { user, loading, logout, updateUserData }
}
