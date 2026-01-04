'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import classes from './reset-password-form.module.scss'
import { updatePassword } from './update-password-service/update-password-service'

export const ResetPasswordForm = ({ userId, secret }: { userId: string; secret: string }) => {
	const router = useRouter()
	const [error, setError] = useState('')
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<{ password: string; confirm: string }>({
		mode: 'onBlur',
	})

	const onSubmit = async (data: { password: string; confirm: string }) => {
		setError('')

		if (data.password !== data.confirm) {
			setError('Passwords do not match')
			return
		}

		try {
			await updatePassword(userId, secret, data.password)
			router.push('/login')
		} catch (err) {
			if (err instanceof Error) setError(err.message)
		}
	}

	return (
		<form className={classes.createPasswordForm} onSubmit={handleSubmit(onSubmit)}>
			<label className={classes.formLabel}>
				<span>New password</span>
				<input type='password' placeholder='Enter the new password' {...register('password', { required: true })} />
			</label>

			<label className={classes.formLabel}>
				<span>Confirm password</span>
				<input type='password' placeholder='Confirm password' {...register('confirm', { required: true })} />
			</label>

			{error && <p className={classes.errorMessage}>{error}</p>}

			<button className={classes.submitButton} disabled={isSubmitting}>
				{isSubmitting ? 'Updating...' : 'Update password'}
			</button>
		</form>
	)
}
