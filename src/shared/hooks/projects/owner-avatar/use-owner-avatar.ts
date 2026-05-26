import { db, storage } from '@/lib/appwrite'
import { useEffect, useState } from 'react'

const avatarCache: Record<string, string> = {}

export const useOwnerAvatar = (userId: string) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!userId) {
			setAvatarUrl('/avatar.jpg')
			setIsLoading(false)
			return
		}

		if (avatarCache[userId]) {
			setAvatarUrl(avatarCache[userId])
			setIsLoading(false)
			return
		}

		const fetchProfile = async () => {
			try {
				const profile = await db.getRow({
					databaseId: process.env.NEXT_PUBLIC_DB_ID!,
					tableId: 'profiles',
					rowId: userId,
				})

				if (profile?.avatarId) {
					const url = storage.getFileView(process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!, profile.avatarId)
					avatarCache[userId] = url
					setAvatarUrl(url)
				} else {
					avatarCache[userId] = '/avatar.jpg'
					setAvatarUrl('/avatar.jpg')
				}
			} catch (e) {
				console.error(e)
				avatarCache[userId] = '/avatar.jpg'
				setAvatarUrl('/avatar.jpg')
			} finally {
				setIsLoading(false)
			}
		}

		if (userId) fetchProfile()
	}, [userId])

	return { avatarUrl, isLoading }
}
