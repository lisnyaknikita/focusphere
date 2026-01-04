'use client'

import { account } from '@/lib/appwrite'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import classes from './page.module.scss'

export default function VerifyEmailPage() {
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

		const verify = async () => {
			try {
				await account.updateVerification(userId, secret)
				setStatus('success')

				setTimeout(() => {
					router.push('/')
				}, 2000)
			} catch (err) {
				console.error(err)
				setStatus('error')
			}
		}

		verify()
	}, [])

	if (status === 'loading') return <p>Verifying…</p>
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
