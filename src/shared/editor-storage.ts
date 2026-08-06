import { account, storage } from '@/lib/appwrite'
import { ID, Permission, Role } from 'appwrite'

const BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!

export const uploadEditorImage = async (file: File): Promise<string> => {
	const user = await account.get()
	const fileId = ID.unique()

	const permissions = [Permission.read(Role.any()), Permission.write(Role.user(user.$id))]

	const response = await storage.createFile(BUCKET_ID, fileId, file, permissions)

	const fileUrl = storage.getFileView(BUCKET_ID, response.$id)

	return fileUrl
}
