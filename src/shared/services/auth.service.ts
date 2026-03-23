import { account, ID } from '@/lib/appwrite'
import { SignupFormValues } from '@/shared/schemas/signup-schema'

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

		const verificationUrl = `${location.origin}${VERIFICATION_REDIRECT_URL}`

		await account.create(ID.unique(), email, password, fullName)
		await account.createEmailPasswordSession(email, password)
		await account.createVerification(verificationUrl)
	},

	async sendRecoveryEmail(email: string) {
		const redirectUrl = `${location.origin}/reset-password`
		await account.createRecovery(email, redirectUrl)
	},

	async updatePassword(userId: string, secret: string, password: string) {
		await account.updateRecovery(userId, secret, password)
	},

	async verifyEmail(userId: string, secret: string) {
		await account.updateVerification(userId, secret)
	},
}
