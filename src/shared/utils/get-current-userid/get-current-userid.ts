import { account } from '@/lib/appwrite'
import { Models } from 'appwrite'

let currentUserPromise: Promise<Models.User<Models.Preferences>> | null = null

export const getCurrentUserId = async () => {
	if (!currentUserPromise) {
		currentUserPromise = account.get()
	}
	try {
		const user = await currentUserPromise
		return user.$id
	} catch (error) {
		currentUserPromise = null
		throw error
	}
}
