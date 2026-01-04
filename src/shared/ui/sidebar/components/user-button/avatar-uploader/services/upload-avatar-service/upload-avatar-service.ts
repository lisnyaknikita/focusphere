import { account, ID, storage } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { Permission, Role } from 'appwrite'

const AVATAR_BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!

export async function uploadNewAvatar(file: File): Promise<string> {
	const user = (await account.get()) as CustomUser
	const userId = user.$id

	const oldAvatarId = user.prefs?.avatarId

	const fileId = ID.unique()
	const permissions = [Permission.read(Role.any()), Permission.write(Role.user(userId))]

	if (oldAvatarId) {
		try {
			await storage.deleteFile(AVATAR_BUCKET_ID, oldAvatarId)
			console.log(`Successfully deleted old avatar: ${oldAvatarId}`)
		} catch (e) {
			console.warn('Failed to delete old avatar, continuing upload.', e)
		}
	}

	await storage.createFile(AVATAR_BUCKET_ID, fileId, file, permissions)

	await account.updatePrefs({ avatarId: fileId })

	const newUrl = storage.getFileView(AVATAR_BUCKET_ID, fileId)

	return newUrl
}
