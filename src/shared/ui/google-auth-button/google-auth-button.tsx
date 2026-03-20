'use client'

import { account } from '@/lib/appwrite'
import { OAuthProvider } from 'appwrite'
import { useState } from 'react'
import { GoogleIcon } from '../icons/google-icon'
import classes from './google-auth-button.module.scss'

export const GoogleAuthButton = () => {
	const [isLoading, setIsLoading] = useState(false)

	const loginWithGoogle = async () => {
		setIsLoading(true)

		const baseUrl =
			process.env.NODE_ENV === 'production' ? 'https://focusphere-test.vercel.app' : 'http://localhost:3000'

		try {
			account.createOAuth2Session({
				provider: OAuthProvider.Google,
				success: `${baseUrl}/dashboard`,
				failure: `${baseUrl}/login`,
			})
		} catch (error) {
			console.error('Auth error:', error)
			setIsLoading(false)
		}
	}

	return (
		<button className={classes.googleButton} onClick={loginWithGoogle} disabled={isLoading}>
			<GoogleIcon />
			<span>{isLoading ? 'Redirecting...' : 'Continue with Google'}</span>
		</button>
	)
}
