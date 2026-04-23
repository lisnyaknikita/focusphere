'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { resetPasswordSchema, ResetPasswordFormValues } from '@/shared/schemas/reset-password-schema'
import { authService } from '@/shared/services/auth.service'
import classes from './reset-password-form.module.scss'

export const ResetPasswordForm = ({ userId, secret }: { userId: string; secret: string }) => {
	const router = useRouter()
	const [error, setError] = useState('')
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		mode: 'onBlur',
	})

	const onSubmit = async (data: ResetPasswordFormValues) => {
		setError('')

		try {
			await authService.updatePassword(userId, secret, data.password)
			router.push(`/login${window.location.search}`)
		} catch (err) {
			if (err instanceof Error) setError(err.message)
		}
	}

	return (
		<form className={classes.createPasswordForm} onSubmit={handleSubmit(onSubmit)}>
			<label className={classes.formLabel}>
				<span>New password</span>
				<input type='password' placeholder='Enter the new password' {...register('password')} />
				{errors.password && <p className={classes.errorMessage}>{errors.password.message}</p>}
			</label>
			<label className={classes.formLabel}>
				<span>Confirm password</span>
				<input type='password' placeholder='Confirm password' {...register('confirm')} />
				{errors.confirm && <p className={classes.errorMessage}>{errors.confirm.message}</p>}
			</label>
			{error && <p className={classes.errorMessage}>{error}</p>}
			<button className={classes.submitButton} disabled={isSubmitting}>
				{isSubmitting ? 'Updating...' : 'Update password'}
			</button>
		</form>
	)
}
