import { useNotesContext } from '@/shared/context/notes-context'
import { useState } from 'react'
import { toast } from 'sonner'
import classes from './new-note-modal.module.scss'

interface NewNoteModalProps {
	onClose: () => void
}

export const NewNoteModal = ({ onClose }: NewNoteModalProps) => {
	const [title, setTitle] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { createNote } = useNotesContext()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!title.trim() || isSubmitting) return

		setIsSubmitting(true)

		const promise = createNote(title)

		toast.promise(promise, {
			loading: 'Creating note...',
			success: 'Note created!',
			error: 'Failed to create note. Please try again.',
		})

		try {
			await promise
			onClose()
		} catch (error) {
			console.error('Failed to create note:', error)
		} finally {
			setIsSubmitting(false)
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
					disabled={isSubmitting}
					autoFocus
				/>
				<div className={classes.buttons}>
					<button type='button' className={classes.cancelButton} onClick={onClose} disabled={isSubmitting}>
						Cancel
					</button>
					<button type='submit' className={classes.confirmButton} disabled={isSubmitting}>
						{isSubmitting ? 'Processing...' : 'Create note'}
					</button>
				</div>
			</form>
		</div>
	)
}
