import { account, storage } from '@/lib/appwrite'
import { ID, Permission, Role } from 'appwrite'

const AVATAR_BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!

export const ensureDefaultAvatar = async (): Promise<string> => {
	const user = await account.get()
	const prefs = (user.prefs || {}) as { avatarId?: string }

	if (prefs.avatarId) return prefs.avatarId

	const res = await fetch('/avatar.jpg')
	const blob = await res.blob()
	const file = new File([blob], 'default-avatar.jpg', { type: blob.type })

	const fileId = ID.unique()

	const permissions = [Permission.read(Role.any()), Permission.write(Role.user(user.$id))]

	await storage.createFile(AVATAR_BUCKET_ID, fileId, file, permissions)

	await account.updatePrefs({ avatarId: fileId })

	return fileId
}
