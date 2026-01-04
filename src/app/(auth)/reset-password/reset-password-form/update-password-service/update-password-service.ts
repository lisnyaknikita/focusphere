import { account } from '@/lib/appwrite'

export async function updatePassword(userId: string, secret: string, password: string) {
	await account.updateRecovery(userId, secret, password)
}
