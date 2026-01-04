import { account, ID } from '@/lib/appwrite'
import { SignupFormValues } from '@/shared/schemas/signup-schema'

const VERIFICATION_REDIRECT_URL = '/verify'

export async function signupUser(data: SignupFormValues): Promise<void> {
	const { fullName, email, password } = data

	const verificationUrl = `${location.origin}${VERIFICATION_REDIRECT_URL}`

	await account.create(ID.unique(), email, password, fullName)

	await account.createEmailPasswordSession(email, password)

	await account.createVerification({ url: verificationUrl })
}
