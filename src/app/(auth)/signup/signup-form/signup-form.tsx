'use client'

import { SignupFormValues, signupSchema } from '@/shared/schemas/signup-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authService } from '@/shared/services/auth.service'
import classes from './signup-form.module.scss'

interface SignupFormProps {
	onSuccess: () => void
}

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
	const [showPassword, setShowPassword] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		mode: 'onBlur',
	})

	const [errorMessage, setErrorMessage] = useState('')

	const onSubmit = async (data: SignupFormValues) => {
		setErrorMessage('')
		try {
			await authService.signupUser(data)

			onSuccess()
		} catch (error) {
			if (error instanceof Error) {
				console.error('Registration failed:', error)
				setErrorMessage(error.message)
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
			{errorMessage && <p className={classes.errorMessage} style={{ marginBottom: '15px' }}>{errorMessage}</p>}
			<button type='submit' className={classes.submitButton} disabled={isSubmitting || !isValid}>
				{isSubmitting ? 'Registering...' : 'Continue'}
			</button>
		</form>
	)
}
