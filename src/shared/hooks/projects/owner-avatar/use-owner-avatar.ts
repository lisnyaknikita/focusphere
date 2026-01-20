import { db, storage } from '@/lib/appwrite'
import { useEffect, useState } from 'react'

export const useOwnerAvatar = (userId: string) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const profile = await db.getRow({
					databaseId: process.env.NEXT_PUBLIC_DB_ID!,
					tableId: 'profiles',
					rowId: userId,
				})

				if (profile?.avatarId) {
					const url = storage.getFileView(process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!, profile.avatarId)
					setAvatarUrl(url)
				}
			} catch (e) {
				console.error(e)
				setAvatarUrl('/avatar.jpg')
			} finally {
				setIsLoading(false)
			}
		}

		if (userId) fetchProfile()
	}, [userId])

	return { avatarUrl, isLoading }
}
