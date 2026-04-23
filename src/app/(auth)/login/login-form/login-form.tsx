import { LoginFormValues, loginSchema } from '@/shared/schemas/login-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import classes from './login-form.module.scss'
import { authService } from '@/shared/services/auth.service'

export const LoginForm = () => {
	const router = useRouter()
	const [errorMessage, setErrorMessage] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		mode: 'onBlur',
	})

	const onSubmit = async (data: LoginFormValues) => {
		setErrorMessage('')

		try {
			await authService.loginUser(data.email, data.password)

			const searchParams = new URLSearchParams(window.location.search)
			const callbackUrl = searchParams.get('callbackUrl')

			router.push(callbackUrl || '/dashboard')
		} catch (err) {
			if (err instanceof Error) {
				setErrorMessage(err.message)
			}
		}
	}

	return (
		<form className={classes.loginForm} onSubmit={handleSubmit(onSubmit)}>
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
						type='password'
						placeholder='Enter password'
						{...register('password')}
						className={clsx({ [classes.errorInput]: errors.password })}
						disabled={isSubmitting}
					/>
					<button className={classes.forgotButton} type="button" onClick={() => router.push(`/forgot${window.location.search}`)}>
						Forgot password?
					</button>
				</div>
				{errors.password && <p className={classes.errorMessage}>{errors.password.message}</p>}
			</label>
			{errorMessage && <p className={classes.errorMessage}>{errorMessage}</p>}
			<button type='submit' className={classes.submitButton} disabled={isSubmitting || !isValid}>
				{isSubmitting ? 'Logging in...' : 'Log In'}
			</button>
		</form>
	)
}
