'use client'

import { GeneralNotesProvider } from '@/shared/context/general-notes-context'
import { useNotesContext } from '@/shared/context/notes-context'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CreateButton } from '@/shared/ui/create-button/create-button'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { NewNoteModal } from './components/header/new-note-modal/new-note-modal'
import { SearchInput } from './components/header/search-input/search-input'
import classes from './page.module.scss'

const NotesContent = ({ setIsNewNoteModalOpened }: { setIsNewNoteModalOpened: (v: boolean) => void }) => {
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)
	const { activeNote, isLoading, deleteNote, notes, searchQuery } = useNotesContext()
	const isSearchEmpty = searchQuery && searchQuery.trim().length > 0 && notes.length === 0

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
		if (activeNote) {
			setIsDeleteConfirmOpen(true)
			setIsTooltipOpen(false)
		}
	}

	const handleConfirmDelete = async () => {
		if (activeNote) {
			await deleteNote(activeNote.$id)
		}
	}

	return (
		<>
			<div className={classes.notesPage}>
				<header className={classes.header}>
					<SearchInput />
					<CreateButton setIsModalVisible={setIsNewNoteModalOpened} text='New note' />
				</header>

				<main className={classes.notes}>
					{isLoading ? (
						<div className={classes.loaderWrapper}>
							<BeatLoader color='#aaa' size={10} />
						</div>
					) : (
						<>
							{isSearchEmpty ? <div className={classes.emptySearch}>No notes found</div> : <NotesList />}
							<TextEditor key={activeNote?.$id} />

							{activeNote && (
								<button
									ref={refs.setReference}
									className={classes.deleteButton}
									onClick={handleDeleteClick}
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
				</main>
			</div>
			<ConfirmModal
				isVisible={isDeleteConfirmOpen}
				message={
					<>
						Are you sure you want to delete &quot;<span className='highlight'>{activeNote?.title || 'this note'}</span>
						&quot;?
					</>
				}
				onConfirm={handleConfirmDelete}
				onClose={() => setIsDeleteConfirmOpen(false)}
			/>
		</>
	)
}

export default function Notes() {
	const [isNewNoteModalOpened, setIsNewNoteModalOpened] = useState(false)
	const { user } = useUser()

	if (!user) return null

	return (
		<GeneralNotesProvider userId={user.$id}>
			<NotesContent setIsNewNoteModalOpened={setIsNewNoteModalOpened} />
			<Modal isVisible={isNewNoteModalOpened} onClose={() => setIsNewNoteModalOpened(false)}>
				<NewNoteModal onClose={() => setIsNewNoteModalOpened(false)} />
			</Modal>
		</GeneralNotesProvider>
	)
}
