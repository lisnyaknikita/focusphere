import classes from './new-entry-modal.module.scss'

export const NewEntryModal = () => {
	return (
		<div className={classes.modalInner}>
			<h3 className={classes.title}>Create Blank Page?</h3>
			<h6 className={classes.subtitle}>
				This page will be created without any template. Are you sure you want to continue?
			</h6>
			<div className={classes.buttons}>
				<button className={classes.confirmButton}>Start empty</button>
				<button className={classes.cancelButton}>Cancel</button>
			</div>
		</div>
	)
}
