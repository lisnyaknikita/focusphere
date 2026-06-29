'use client'

import { account } from '@/lib/appwrite'
import { APP_URL } from '@/shared/constants/app'
import { OAuthProvider } from 'appwrite'
import { useState } from 'react'
import { toast } from 'sonner'
import { GoogleIcon } from '../icons/google-icon'
import classes from './google-auth-button.module.scss'

export const GoogleAuthButton = () => {
	const [isLoading, setIsLoading] = useState(false)

	const loginWithGoogle = async () => {
		setIsLoading(true)

		try {
			const searchParams = new URLSearchParams(window.location.search)
			const callbackUrl = searchParams.get('callbackUrl')
			const successRedirect = callbackUrl ? `${APP_URL}${callbackUrl}` : `${APP_URL}/dashboard`

			account.createOAuth2Session(OAuthProvider.Google, successRedirect, `${APP_URL}/login`, [
				'https://www.googleapis.com/auth/calendar',
			])
		} catch (error) {
			console.error('Auth error:', error)
			toast.error('Failed to log in with Google. Please try again.')
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
