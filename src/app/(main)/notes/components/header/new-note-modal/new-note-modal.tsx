import { useNotesContext } from '@/shared/context/notes-context'
import { useState } from 'react'
import classes from './new-note-modal.module.scss'

interface NewNoteModalProps {
	onClose: () => void
}

export const NewNoteModal = ({ onClose }: NewNoteModalProps) => {
	const [title, setTitle] = useState('')
	const { createNote } = useNotesContext()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!title.trim()) return

		try {
			await createNote(title)
			onClose()
		} catch (error) {
			console.error('Failed to create note:', error)
		}
	}

	return (
		<div className={classes.modalInner}>
			<form className={classes.newNoteModal} onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='New note'
					className={classes.eventTitle}
					aria-label='Note title'
					value={title}
					onChange={e => setTitle(e.target.value)}
					autoFocus
				/>
				<div className={classes.buttons}>
					<button type='submit' className={classes.confirmButton}>
						Create note
					</button>
					<button type='button' className={classes.cancelButton} onClick={onClose}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}
