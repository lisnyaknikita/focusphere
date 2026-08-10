import { account, storage } from '@/lib/appwrite'
import { ID, Permission, Role } from 'appwrite'
import { toast } from 'sonner'

const BUCKET_ID = process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!
const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export const uploadEditorImage = async (file: File): Promise<string> => {
	const user = await account.get()
	const fileId = ID.unique()

	const permissions = [Permission.read(Role.any()), Permission.write(Role.user(user.$id))]

	const response = await storage.createFile(BUCKET_ID, fileId, file, permissions)

	return storage.getFileView(BUCKET_ID, response.$id)
}

export const uploadBlockNoteImage = async (file: File): Promise<string> => {
	if (!ALLOWED_TYPES.includes(file.type)) {
		toast.error('Unsupported image format. Use PNG, JPEG, WEBP or GIF.')
		throw new Error('Unsupported image format')
	}

	if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
		toast.error(`Image size must be less than ${MAX_FILE_SIZE_MB}MB`)
		throw new Error('File size exceeds limit')
	}

	try {
		return await uploadEditorImage(file)
	} catch (error) {
		console.error('Failed to upload image:', error)
		toast.error('Failed to upload image. Please try again.')
		throw error
	}
}
