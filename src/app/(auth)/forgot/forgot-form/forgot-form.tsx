'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { forgotSchema, ForgotFormValues } from '@/shared/schemas/forgot-schema'
import { authService } from '@/shared/services/auth.service'
import classes from './forgot-form.module.scss'

export const ForgotForm = () => {
	const [success, setSuccess] = useState(false)
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
			await authService.sendRecoveryEmail(email)
			setSuccess(true)
		} catch (err) {
			console.error(err)
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
