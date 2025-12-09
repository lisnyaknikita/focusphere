import { account } from '@/lib/appwrite'

export const getCurrentUserId = async () => {
	const user = await account.get()
	return user.$id
}
