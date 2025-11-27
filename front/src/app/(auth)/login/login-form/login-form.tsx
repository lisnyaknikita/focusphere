import classes from './login-form.module.scss'

export const LoginForm = () => {
	return (
		<form className={classes.loginForm}>
			<label className={classes.formLabel}>
				<span>Email</span>
				<input type='email' placeholder='Enter your email' />
			</label>
			<label className={classes.formLabel}>
				<span>Password</span>
				<input type='password' placeholder='Enter password' />
				<button className={classes.forgotButton}>Forgot password?</button>
			</label>
			<button className={classes.submitButton}>Log In</button>
		</form>
	)
}
