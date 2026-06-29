'use client'

import { ForgotFormValues, forgotSchema } from '@/shared/schemas/forgot-schema'
import { authService } from '@/shared/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import classes from './forgot-form.module.scss'

export const ForgotForm = () => {
	const [success, setSuccess] = useState(false)
	const searchParams = useSearchParams()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotFormValues>({
		resolver: zodResolver(forgotSchema),
		mode: 'onBlur',
	})

	const onSubmit = async ({ email }: ForgotFormValues) => {
		try {
			const callbackUrl = searchParams.get('callbackUrl')
			const origin = typeof window !== 'undefined' ? window.location.origin : ''

			await authService.sendRecoveryEmail(email, origin, callbackUrl)

			toast.success('Recovery link sent successfully!')
			setSuccess(true)
		} catch (err) {
			console.error(err)

			if (err instanceof Error) {
				toast.error(err.message)
			} else {
				toast.error('Failed to send recovery email. Please try again.')
			}
		}
	}

	if (success) {
		return (
			<div className={classes.success}>
				<p>We sent a recovery link to your email.</p>
			</div>
		)
	}

	return (
		<form className={classes.forgotForm} onSubmit={handleSubmit(onSubmit)}>
			<label className={classes.formLabel}>
				<input type='email' placeholder='Enter your email' {...register('email')} />
			</label>
			{errors.email && <p className={classes.error}>{errors.email.message}</p>}
			<button className={classes.submitButton} disabled={isSubmitting}>
				{isSubmitting ? 'Sending...' : 'Send reset link'}
			</button>
		</form>
	)
}
