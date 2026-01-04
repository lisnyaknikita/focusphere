'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import classes from './page.module.scss'
import { ResetPasswordForm } from './reset-password-form/reset-password-form'

function ResetPasswordContent() {
	const params = useSearchParams()
	const userId = params.get('userId')
	const secret = params.get('secret')

	if (!userId || !secret) return <p>Invalid password reset link.</p>

	return (
		<div className={classes.createPasswordBlock}>
			<h1 className={classes.title}>Create a new password</h1>
			<ResetPasswordForm userId={userId} secret={secret} />
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<div className={classes.createPasswordPage}>
			<Suspense fallback={<p>Loading...</p>}>
				<ResetPasswordContent />
			</Suspense>
		</div>
	)
}
