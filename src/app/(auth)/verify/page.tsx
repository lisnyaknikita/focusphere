'use client'

import { authService } from '@/shared/services/auth.service'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { toast } from 'sonner'
import classes from './page.module.scss'

function VerifyEmailContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

	useEffect(() => {
		const userId = searchParams.get('userId')
		const secret = searchParams.get('secret')

		if (!userId || !secret) {
			setStatus('error')
			return
		}

		let timeoutId: NodeJS.Timeout

		const verify = async () => {
			try {
				await authService.verifyEmail(userId, secret)
				setStatus('success')
				toast.success('Email successfully verified!')

				const callbackUrl = searchParams.get('callbackUrl')

				timeoutId = setTimeout(() => {
					router.push(callbackUrl || '/dashboard')
					router.refresh()
				}, 2000)
			} catch (err) {
				console.error(err)
				setStatus('error')

				if (err instanceof Error) {
					toast.error(err.message)
				} else {
					toast.error('Verification failed. The link may be expired.')
				}
			}
		}

		verify()

		return () => {
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [searchParams, router])

	if (status === 'loading') return <p className={classes.loading}>Verifying…</p>

	if (status === 'success')
		return (
			<div className={classes.verifyPage}>
				<div className={classes.verifyBlock}>
					<h2>Email verified!</h2>
					<p>You will be automatically redirected to the main page.</p>
				</div>
			</div>
		)

	return (
		<div className={classes.verifyPage}>
			<div className={classes.verifyBlock}>
				<h2>Verification failed</h2>
				<p>The link may be expired or invalid.</p>
			</div>
		</div>
	)
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<VerifyEmailContent />
		</Suspense>
	)
}
