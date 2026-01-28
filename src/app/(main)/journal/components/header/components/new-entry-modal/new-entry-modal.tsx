import { useNotesContext } from '@/shared/context/notes-context'
import classes from './new-entry-modal.module.scss'

interface NewEntryModalProps {
	onClose: () => void
}

export const NewEntryModal = ({ onClose }: NewEntryModalProps) => {
	const { createNote } = useNotesContext()

	const handleCreateEmpty = async () => {
		await createNote('empty')
		onClose()
	}

	return (
		<div className={classes.modalInner}>
			<h3 className={classes.title}>Create Blank Page?</h3>
			<h6 className={classes.subtitle}>
				This page will be created without any template. Are you sure you want to continue?
			</h6>
			<div className={classes.buttons}>
				<button className={classes.confirmButton} onClick={handleCreateEmpty}>
					Start empty
				</button>
				<button className={classes.cancelButton} onClick={onClose}>
					Cancel
				</button>
			</div>
		</div>
	)
}
