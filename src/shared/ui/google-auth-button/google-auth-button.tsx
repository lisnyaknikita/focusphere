'use client'

import { account } from '@/lib/appwrite'
import { OAuthProvider } from 'appwrite'
import { useState } from 'react'
import classes from './google-auth-button.module.scss'

export const GoogleAuthButton = () => {
	const [isLoading, setIsLoading] = useState(false)

	const loginWithGoogle = async () => {
		setIsLoading(true)

		const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
			? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
			: 'http://localhost:3000'

		try {
			account.createOAuth2Session({
				provider: OAuthProvider.Google,
				success: `${baseUrl}/`,
				failure: `${baseUrl}/login`,
			})
		} catch (error) {
			console.error('Auth error:', error)
			setIsLoading(false)
		}
	}

	return (
		<button className={classes.googleButton} onClick={loginWithGoogle} disabled={isLoading}>
			<svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<g clipPath='url(#clip0_2406_2176)'>
					<path
						d='M23.7148 12.2245C23.7148 11.2413 23.635 10.5238 23.4623 9.77966H12.2344V14.2176H18.8249C18.6921 15.3205 17.9746 16.9815 16.3801 18.0976L16.3577 18.2462L19.9078 20.9964L20.1537 21.0209C22.4126 18.9347 23.7148 15.8653 23.7148 12.2245Z'
						fill='#4285F4'
					/>
					<path
						d='M12.234 23.9176C15.4628 23.9176 18.1734 22.8545 20.1533 21.0209L16.3797 18.0976C15.3698 18.8018 14.0145 19.2934 12.234 19.2934C9.07158 19.2934 6.38751 17.2074 5.43072 14.324L5.29048 14.3359L1.59906 17.1927L1.55078 17.3269C3.51732 21.2334 7.55674 23.9176 12.234 23.9176Z'
						fill='#34A853'
					/>
					<path
						d='M5.4309 14.324C5.17844 13.5799 5.03234 12.7826 5.03234 11.9588C5.03234 11.1349 5.17844 10.3377 5.41762 9.5936L5.41093 9.43513L1.67325 6.53241L1.55096 6.59058C0.740459 8.21168 0.275391 10.0321 0.275391 11.9588C0.275391 13.8855 0.740459 15.7058 1.55096 17.3269L5.4309 14.324Z'
						fill='#FBBC05'
					/>
					<path
						d='M12.234 4.62403C14.4795 4.62403 15.9943 5.59401 16.858 6.40461L20.233 3.10928C18.1602 1.1826 15.4628 0 12.234 0C7.55673 0 3.51732 2.68406 1.55078 6.59056L5.41744 9.59359C6.38751 6.7102 9.07157 4.62403 12.234 4.62403Z'
						fill='#EB4335'
					/>
				</g>
				<defs>
					<clipPath id='clip0_2406_2176'>
						<rect width='24' height='24' fill='white' />
					</clipPath>
				</defs>
			</svg>
			<span>{isLoading ? 'Redirecting...' : 'Continue with Google'}</span>
		</button>
	)
}
