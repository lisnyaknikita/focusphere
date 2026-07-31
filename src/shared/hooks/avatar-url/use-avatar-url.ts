'use client'

import { account, storage } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { useEffect, useState } from 'react'

const AVATAR_BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!

export const useAvatarUrl = (user: CustomUser | null) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

	useEffect(() => {
		if (!user) {
			setAvatarUrl(null)
			return
		}

		const loadAvatar = async () => {
			try {
				const avatarId = user.prefs?.avatarId

				if (!avatarId) {
					setAvatarUrl(null)
					return
				}

				try {
					const file = await storage.getFile(AVATAR_BUCKET_ID, avatarId)
					if (file.name === 'default-avatar.jpg') {
						await storage.deleteFile(AVATAR_BUCKET_ID, avatarId).catch(() => {})
						await account.updatePrefs({ ...user.prefs, avatarId: '' }).catch(() => {})
						setAvatarUrl(null)
						return
					}
				} catch (e) {
					console.log(e)
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
