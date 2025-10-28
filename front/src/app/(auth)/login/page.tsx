import { Logo } from '@/shared/ui/sidebar/components/logo/logo'
import classes from './page.module.scss'

export default function LoginPage() {
	return (
		<div className={classes.loginPage}>
			<div className={classes.loginForm}>form</div>
			<div className={classes.logo}>
				<Logo />
			</div>
			<div className={classes.authPrompt}>
				<span>Don&apos;t have an account?</span>
				<button className={classes.button}>Sign up</button>
			</div>
		</div>
	)
}
