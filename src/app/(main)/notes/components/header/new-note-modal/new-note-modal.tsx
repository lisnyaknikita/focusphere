import { useNewNote } from '@/shared/hooks/projects/notes/use-new-note'
import classes from './new-note-modal.module.scss'

interface NewNoteModalProps {
	onClose: () => void
}

export const NewNoteModal = ({ onClose }: NewNoteModalProps) => {
	const { title, setTitle, onSubmit } = useNewNote(onClose)

	return (
		<div className={classes.modalInner}>
			<form className={classes.newNoteModal} onSubmit={onSubmit}>
				<input
					type='text'
					placeholder='New note'
					className={classes.eventTitle}
					aria-label='Note title'
					value={title}
					onChange={e => setTitle(e.target.value)}
					autoFocus
				/>
				{/* <TagsInput /> */}
				<div className={classes.buttons}>
					<button type='submit' className={classes.confirmButton}>
						Create note
					</button>
					<button type='submit' className={classes.cancelButton} onClick={onClose}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}
