'use client'

import { SignupFormValues, signupSchema } from '@/shared/schemas/signup-schema'
import { authService } from '@/shared/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import classes from './signup-form.module.scss'

interface SignupFormProps {
	onSuccess: () => void
}

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
	const [showPassword, setShowPassword] = useState(false)
	const searchParams = useSearchParams()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		mode: 'onBlur',
	})

	const onSubmit = async (data: SignupFormValues) => {
		try {
			const callbackUrl = searchParams.get('callbackUrl')
			const origin = typeof window !== 'undefined' ? window.location.origin : ''

			await authService.signupUser(data, origin, callbackUrl)

			toast.success('Account created successfully!')
			onSuccess()
		} catch (error) {
			if (error instanceof Error) {
				console.error('Registration failed:', error)
				toast.error(error.message)
			} else {
				toast.error('Something went wrong. Please try again.')
			}
		}
	}

	return (
		<form className={classes.signupForm} onSubmit={handleSubmit(onSubmit)}>
			<label className={classes.formLabel}>
				<span>Full name</span>
				<input
					type='text'
					placeholder='John Doe'
					{...register('fullName')}
					disabled={isSubmitting}
					className={clsx({ [classes.errorInput]: errors.fullName })}
				/>
				{errors.fullName && <p className={classes.errorMessage}>{errors.fullName.message}</p>}
			</label>
			<label className={classes.formLabel}>
				<span>Email</span>
				<input
					type='email'
					placeholder='Enter your email'
					{...register('email')}
					className={clsx({ [classes.errorInput]: errors.email })}
					disabled={isSubmitting}
				/>
				{errors.email && <p className={classes.errorMessage}>{errors.email.message}</p>}
			</label>
			<label className={classes.formLabel}>
				<span>Password</span>
				<div className={classes.passwordContainer}>
					<input
						type={showPassword ? 'text' : 'password'}
						placeholder='Enter password'
						{...register('password')}
						className={clsx({ [classes.errorInput]: errors.password })}
						disabled={isSubmitting}
					/>
					<button
						type='button'
						className={classes.showPasswordButton}
						onClick={() => setShowPassword(prev => !prev)}
						disabled={isSubmitting}
					>
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>
				{errors.password && <p className={classes.errorMessage}>{errors.password.message}</p>}
			</label>

			<button type='submit' className={classes.submitButton} disabled={isSubmitting || !isValid}>
				{isSubmitting ? 'Registering...' : 'Continue'}
			</button>
		</form>
	)
}
