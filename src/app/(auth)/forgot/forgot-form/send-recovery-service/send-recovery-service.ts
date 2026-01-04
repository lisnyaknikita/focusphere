import { account } from '@/lib/appwrite'

export async function sendRecoveryEmail(email: string) {
	const redirectUrl = `${location.origin}/reset-password`

	await account.createRecovery(email, redirectUrl)
}
