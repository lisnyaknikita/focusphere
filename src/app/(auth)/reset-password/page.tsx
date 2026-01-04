'use client'

import { useSearchParams } from 'next/navigation'
import classes from './page.module.scss'
import { ResetPasswordForm } from './reset-password-form/reset-password-form'

export default function ResetPasswordPage() {
	const params = useSearchParams()

	const userId = params.get('userId')
	const secret = params.get('secret')

	if (!userId || !secret) return <p>Invalid password reset link.</p>

	return (
		<div className={classes.createPasswordPage}>
			<div className={classes.createPasswordBlock}>
				<h1 className={classes.title}>Create a new password</h1>
				<ResetPasswordForm userId={userId} secret={secret} />
			</div>
		</div>
	)
}
