import { account } from '@/lib/appwrite'

export async function loginUser(email: string, password: string) {
	await account.createEmailPasswordSession(email, password)

	const user = await account.get()

	if (!user.emailVerification) {
		await account.deleteSession('current')
		throw new Error('Please verify your email before logging in.')
	}

	return user
}
