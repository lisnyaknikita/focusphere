import { account, ID } from '@/lib/appwrite'
import { SignupFormValues } from '@/shared/schemas/signup-schema'
import { AppwriteException } from 'appwrite'

const VERIFICATION_REDIRECT_URL = '/verify'

export const authService = {
	async loginUser(email: string, password: string) {
		await account.createEmailPasswordSession(email, password)

		const user = await account.get()

		if (!user.emailVerification) {
			await account.deleteSession('current')
			throw new Error('Please verify your email before logging in.')
		}

		return user
	},

	async signupUser(data: SignupFormValues): Promise<void> {
		const { fullName, email, password } = data

		const searchParams = new URLSearchParams(window.location.search)
		const callbackUrl = searchParams.get('callbackUrl')

		const verificationUrl = `${location.origin}${VERIFICATION_REDIRECT_URL}${
			callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''
		}`

		try {
			await account.create(ID.unique(), email, password, fullName)
			await account.createEmailPasswordSession(email, password)
			await account.createVerification(verificationUrl)
		} catch (error) {
			if (error instanceof AppwriteException && error.code === 409) {
				throw new Error(
					'An account with this email already exists. If you were invited, please use the Login page and click "Forgot password?" to set your password.'
				)
			}
			throw error
		}
	},

	async sendRecoveryEmail(email: string) {
		const searchParams = new URLSearchParams(window.location.search)
		const callbackUrl = searchParams.get('callbackUrl')
		const redirectUrl = `${location.origin}/reset-password${
			callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''
		}`
		await account.createRecovery(email, redirectUrl)
	},

	async updatePassword(userId: string, secret: string, password: string) {
		await account.updateRecovery(userId, secret, password)
	},

	async verifyEmail(userId: string, secret: string) {
		await account.updateVerification(userId, secret)
	},
}
