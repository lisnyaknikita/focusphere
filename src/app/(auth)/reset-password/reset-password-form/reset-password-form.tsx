'use client'

import { ResetPasswordFormValues, resetPasswordSchema } from '@/shared/schemas/reset-password-schema'
import { authService } from '@/shared/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import classes from './reset-password-form.module.scss'

interface ResetPasswordFormProps {
	userId: string
	secret: string
}

export const ResetPasswordForm = ({ userId, secret }: ResetPasswordFormProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		mode: 'onBlur',
	})

	const onSubmit = async (data: ResetPasswordFormValues) => {
		try {
			await authService.updatePassword(userId, secret, data.password)

			toast.success('Password updated successfully! You can now log in.')

			const currentParams = searchParams.toString()
			const loginUrl = currentParams ? `/login?${currentParams}` : '/login'

			router.push(loginUrl)
		} catch (err) {
			console.error(err)
			if (err instanceof Error) {
				toast.error(err.message)
			} else {
				toast.error('Failed to update password. Please try again.')
			}
		}
	}

	return (
		<form className={classes.createPasswordForm} onSubmit={handleSubmit(onSubmit)}>
			<label className={classes.formLabel}>
				<span>New password</span>
				<input type='password' placeholder='Enter the new password' {...register('password')} disabled={isSubmitting} />
				{errors.password && <p className={classes.errorMessage}>{errors.password.message}</p>}
			</label>
			<label className={classes.formLabel}>
				<span>Confirm password</span>
				<input type='password' placeholder='Confirm password' {...register('confirm')} disabled={isSubmitting} />
				{errors.confirm && <p className={classes.errorMessage}>{errors.confirm.message}</p>}
			</label>
			<button className={classes.submitButton} disabled={isSubmitting}>
				{isSubmitting ? 'Updating...' : 'Update password'}
			</button>
		</form>
	)
}
