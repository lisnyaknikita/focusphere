import { ForgotForm } from './forgot-form/forgot-form'
import classes from './page.module.scss'

export default function ForgotPasswordPage() {
	return (
		<div className={classes.forgotPage}>
			<div className={classes.forgotBlock}>
				<h1 className={classes.title}>Reset your password</h1>
				<ForgotForm />
			</div>
		</div>
	)
}
