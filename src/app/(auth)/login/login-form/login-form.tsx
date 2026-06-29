import { LoginFormValues, loginSchema } from '@/shared/schemas/login-schema'
import { authService } from '@/shared/services/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import classes from './login-form.module.scss'

export const LoginForm = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		mode: 'onBlur',
	})

	const onSubmit = async (data: LoginFormValues) => {
		try {
			await authService.loginUser(data.email, data.password)

			const callbackUrl = searchParams.get('callbackUrl')

			toast.success('Welcome back!')

			router.push(callbackUrl || '/dashboard')

			router.refresh()
		} catch (err) {
			if (err instanceof Error) {
				toast.error(err.message)
			} else {
				toast.error('Failed to log in. Please check your credentials.')
			}
		}
	}

	const handleForgotPassword = () => {
		const currentParams = searchParams.toString()
		const forgotUrl = currentParams ? `/forgot?${currentParams}` : '/forgot'
		router.push(forgotUrl)
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
					<button className={classes.forgotButton} type='button' onClick={handleForgotPassword} disabled={isSubmitting}>
						Forgot password?
					</button>
				</div>
				{errors.password && <p className={classes.errorMessage}>{errors.password.message}</p>}
			</label>

			<button type='submit' className={classes.submitButton} disabled={isSubmitting}>
				{isSubmitting ? 'Logging in...' : 'Log In'}
			</button>
		</form>
	)
}
