import { DurationPicker } from './components/duration-picker/duration-picker'
import classes from './timer-settings-modal.module.scss'

export const TimerSettingsModal = () => {
	return (
		<div className={classes.modalInner}>
			<h3 className={classes.title}>Pomodoro settings</h3>
			<h6 className={classes.subtitle}>Customize your focus flow</h6>
			<form className={classes.settingsForm}>
				<label className={classes.formItem}>
					<span className={classes.label}>Flow duration</span>
					<DurationPicker type='flow' />
				</label>
				<label className={classes.formItem}>
					<span className={classes.label}>Break duration</span>
					<DurationPicker type='break' />
				</label>
				<label className={classes.formItem}>
					<span className={classes.label}>Number of sessions</span>
					<DurationPicker type='sessions' />
				</label>
			</form>
		</div>
	)
}
