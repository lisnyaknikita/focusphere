import { TagsInput } from '../tags-input/tags-input'
import classes from './new-note-modal.module.scss'

export const NewNoteModal = () => {
	return (
		<div className={classes.modalInner}>
			<form className={classes.newNoteModal}>
				<input type='text' placeholder='New note' className={classes.eventTitle} aria-label='Note title' />
				<TagsInput />
				<div className={classes.buttons}>
					<button className={classes.confirmButton}>Create note</button>
					<button className={classes.cancelButton}>Cancel</button>
				</div>
			</form>
		</div>
	)
}
