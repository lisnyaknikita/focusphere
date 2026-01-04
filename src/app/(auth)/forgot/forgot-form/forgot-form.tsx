'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import classes from './forgot-form.module.scss'
import { sendRecoveryEmail } from './send-recovery-service/send-recovery-service'

export const ForgotForm = () => {
	const [success, setSuccess] = useState(false)
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<{ email: string }>()

	const onSubmit = async ({ email }: { email: string }) => {
		try {
			await sendRecoveryEmail(email)
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
				<input type='email' placeholder='Enter your email' {...register('email', { required: true })} />
			</label>
			{errors.email && <p className={classes.error}>Email is required</p>}
			<button className={classes.submitButton} disabled={isSubmitting}>
				{isSubmitting ? 'Sending...' : 'Send reset link'}
			</button>
		</form>
	)
}
