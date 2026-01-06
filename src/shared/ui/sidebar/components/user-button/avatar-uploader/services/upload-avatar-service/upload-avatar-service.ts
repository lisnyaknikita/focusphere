import { account, db, ID, storage } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { AppwriteException, Permission, Role } from 'appwrite'

const AVATAR_BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!
const DATABASE_ID = process.env.NEXT_PUBLIC_DB_ID!
const PROFILES_COLLECTION_ID = 'profiles'

export async function uploadNewAvatar(file: File): Promise<string> {
	const user = (await account.get()) as CustomUser
	const userId = user.$id
	const oldAvatarId = user.prefs?.avatarId

	if (oldAvatarId) {
		try {
			await storage.deleteFile(AVATAR_BUCKET_ID, oldAvatarId)
		} catch (error) {
			if (error instanceof AppwriteException) {
				console.warn(`Failed to delete old avatar: ${error.message}`)
			} else {
				console.warn('An unknown error occurred while deleting file')
			}
		}
	}

	const fileId = ID.unique()
	const permissions = [Permission.read(Role.any()), Permission.write(Role.user(userId))]
	await storage.createFile(AVATAR_BUCKET_ID, fileId, file, permissions)

	await account.updatePrefs({ ...user.prefs, avatarId: fileId })

	try {
		await db.updateRow({
			databaseId: DATABASE_ID,
			tableId: PROFILES_COLLECTION_ID,
			rowId: userId,
			data: {
				avatarId: fileId,
				name: user.name,
			},
		})
	} catch (error) {
		if (error instanceof AppwriteException) {
			const isNotFound = error.code === 404 || error.message.includes('not found')

			if (isNotFound) {
				await db.createRow({
					databaseId: DATABASE_ID,
					tableId: PROFILES_COLLECTION_ID,
					rowId: userId,
					data: {
						userId: userId,
						avatarId: fileId,
						name: user.name,
					},
				})
			} else {
				console.error('Database sync failed:', error.message)
			}
		} else {
			console.error('An unexpected error occurred during sync')
		}
	}

	return storage.getFileView(AVATAR_BUCKET_ID, fileId)
}
