'use client'

import { storage } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { useEffect, useState } from 'react'

const AVATAR_BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!

export const useAvatarUrl = (user: CustomUser | null) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

	useEffect(() => {
		if (!user) return

		const loadAvatar = async () => {
			try {
				const avatarId = user.prefs?.avatarId

				if (!avatarId) {
					setAvatarUrl(null)
					return
				}

				const url = storage.getFileView(AVATAR_BUCKET_ID, avatarId)
				setAvatarUrl(url)
			} catch (e) {
				console.error('Avatar error:', e)
				setAvatarUrl(null)
			}
		}

		loadAvatar()
	}, [user])

	return { avatarUrl, setAvatarUrl }
}
