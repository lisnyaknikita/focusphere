'use client'

import { GoogleAuthButton } from '@/shared/ui/google-auth-button/google-auth-button'
import { Logo } from '@/shared/ui/sidebar/components/logo/logo'
import Link from 'next/link'
import { LoginForm } from './login-form/login-form'
import classes from './page.module.scss'

export default function LoginPage() {
	return (
		<div className={classes.loginPage}>
			<div className={classes.loginBlock}>
				<h1 className={classes.title}>Welcome back!</h1>
				<GoogleAuthButton />
				<div className={classes.divider}>
					<hr />
					<span>OR</span>
				</div>
				<LoginForm />
			</div>
			<div className={classes.logo}>
				<Logo />
			</div>
			<div className={classes.authPrompt}>
				<span>Don&apos;t have an account?</span>
				<Link href={'/signup'} className={classes.button}>
					Sign up
				</Link>
			</div>
		</div>
	)
}
