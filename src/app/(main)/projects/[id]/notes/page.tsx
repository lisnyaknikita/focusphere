'use client'

import { useDeleteNote } from '@/shared/hooks/projects/notes/use-delete-note'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './page.module.scss'

export default function NotesPage() {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const { activeNote, isNotesLoading, handleDelete } = useDeleteNote()

	return (
		<>
			<div className={classes.notesPage}>
				<div className={classes.inner}>
					{isNotesLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<>
							<NotesList withTitle={true} withTags={true} />
							<TextEditor />
							{activeNote && (
								<button className={classes.deleteButton} onClick={() => setIsConfirmOpen(true)} disabled={!activeNote}>
									<DeleteIcon />
								</button>
							)}
						</>
					)}
				</div>
			</div>
			<ConfirmModal
				isVisible={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				onConfirm={handleDelete}
				title='Delete Note'
				message={
					<>
						Are you sure you want to delete &quot;<span className='highlight'>{activeNote?.title}</span>&quot;?
					</>
				}
			/>
		</>
	)
}
