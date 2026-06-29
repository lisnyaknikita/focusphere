'use client'

import { GoogleAuthButton } from '@/shared/ui/google-auth-button/google-auth-button'
import { Logo } from '@/shared/ui/sidebar/components/logo/logo'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import classes from './page.module.scss'
import { SignupForm } from './signup-form/signup-form'

export default function SignupPage() {
	const [isSuccess, setIsSuccess] = useState(false)
	const [loginUrl, setLoginUrl] = useState('/login')

	useEffect(() => {
		if (window.location.search) {
			setLoginUrl(`/login${window.location.search}`)
		}
	}, [])

	return (
		<div className={classes.signupPage}>
			<div className={classes.signupBlock}>
				{isSuccess ? (
					<div className={classes.successMessage}>
						<h2>Success!</h2>
						<p>Your account has been created. We have sent a verification link to your email.</p>
						<p>Please check your spam folder if you do not see it within a few minutes.</p>
					</div>
				) : (
					<>
						<h1 className={classes.title}>Seconds to sign up!</h1>
						<GoogleAuthButton />
						<div className={classes.divider}>
							<hr />
							<span>OR</span>
						</div>
						<Suspense fallback={<p>Loading...</p>}>
							<SignupForm onSuccess={() => setIsSuccess(true)} />
						</Suspense>
					</>
				)}
			</div>
			<div className={classes.logo}>
				<Logo />
			</div>
			<div className={classes.authPrompt}>
				<span>Already have an account?</span>
				<Link href={loginUrl} className={classes.button}>
					Login
				</Link>
			</div>
		</div>
	)
}
