'use client'

import { useDeleteNote } from '@/shared/hooks/projects/notes/use-delete-note'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './page.module.scss'

export default function NotesPage() {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)
	const { activeNote, isNotesLoading, handleDelete } = useDeleteNote()

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'left',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const handleDeleteClick = () => {
		setIsConfirmOpen(true)
		setIsTooltipOpen(false)
	}

	return (
		<>
			<div className={classes.notesPage}>
				<div className={classes.inner}>
					{isNotesLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<>
							<NotesList withTitle={true} withTags={true} />
							<TextEditor key={activeNote?.$id} />
							{activeNote && (
								<button
									ref={refs.setReference}
									className={classes.deleteButton}
									onClick={handleDeleteClick}
									disabled={!activeNote}
									{...getReferenceProps()}
								>
									<DeleteIcon />
									{isTooltipOpen && (
										<div
											ref={refs.setFloating}
											style={{
												...floatingStyles,
												background: 'var(--save-button-bg)',
												color: 'var(--save-button-text)',
												padding: '4px 8px',
												borderRadius: '5px',
												fontSize: '13px',
												fontWeight: 700,
												zIndex: 1000,
												whiteSpace: 'nowrap',
											}}
											{...getFloatingProps()}
										>
											Delete note
										</div>
									)}
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
