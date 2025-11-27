import { GoogleAuthButton } from '@/shared/ui/google-auth-button/google-auth-button'
import { Logo } from '@/shared/ui/sidebar/components/logo/logo'
import Link from 'next/link'
import classes from './page.module.scss'

export default function SignupPage() {
	return (
		<div className={classes.signupPage}>
			<div className={classes.signupBlock}>
				<h1 className={classes.title}>Seconds to sign up!</h1>
				<GoogleAuthButton />
				<div className={classes.divider}>
					<hr />
					<span>OR</span>
				</div>
				<form className={classes.signupForm}>
					<label className={classes.formLabel}>
						<span>Full name</span>
						<input type='text' placeholder='John Doe' />
					</label>
					<label className={classes.formLabel}>
						<span>Email</span>
						<input type='email' placeholder='Enter your email' />
					</label>
					<label className={classes.formLabel}>
						<span>Password</span>
						<input type='password' placeholder='Enter password' />
						<button className={classes.showPasswordButton}>Show</button>
					</label>
					<button className={classes.submitButton}>Continue</button>
				</form>
			</div>
			<div className={classes.logo}>
				<Logo />
			</div>
			<div className={classes.authPrompt}>
				<span>Already have an account?</span>
				<Link href={'/login'} className={classes.button}>
					Login
				</Link>
			</div>
		</div>
	)
}
