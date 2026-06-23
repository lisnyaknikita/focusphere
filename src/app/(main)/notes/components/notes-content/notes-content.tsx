import { useBilling } from '@/shared/context/billing-context'
import { useNotesContext } from '@/shared/context/notes-context'
import { useFocusMode } from '@/shared/hooks/use-focus-mode/use-focus-mode'
import { TextEditorRef } from '@/shared/types/text-editor'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CreateButton } from '@/shared/ui/create-button/create-button'
import { ExpandIcon } from '@/shared/ui/icons/expand-icon'
import { MinimizeIcon } from '@/shared/ui/icons/minimize-icon'
import { UndoIcon } from '@/shared/ui/icons/undo-icon'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { SearchInput } from '../header/search-input/search-input'
import classes from './notes-content.module.scss'

export const NotesContent = ({ setIsNewNoteModalOpened }: { setIsNewNoteModalOpened: (v: boolean) => void }) => {
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
	const [isHydrated, setIsHydrated] = useState(false)

	const editorRef = useRef<TextEditorRef>(null)

	const { isFocusMode, toggleFocusMode } = useFocusMode('generalNotes')
	const { activeNote, isLoading, deleteNote, notes, searchQuery } = useNotesContext()

	const { isPro, openPaywall } = useBilling()

	const isSearchEmpty = searchQuery && searchQuery.trim().length > 0 && notes.length === 0

	const handleCreateNoteClick = () => {
		if (!isPro && notes.length >= 6) {
			openPaywall('notes_unlimited')
			return
		}
		setIsNewNoteModalOpened(true)
	}

	const handleDeleteClick = () => {
		if (activeNote) {
			setIsDeleteConfirmOpen(true)
		}
	}

	const handleConfirmDelete = async () => {
		if (activeNote) {
			await deleteNote(activeNote.$id)
		}
	}

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	if (!isHydrated)
		return (
			<div className={classes.notesPage}>
				<div className={classes.loaderWrapper}>
					<BeatLoader color='#aaa' size={10} />
				</div>
			</div>
		)

	return (
		<>
			<motion.div
				className={clsx(classes.notesPage, isFocusMode && classes.focusMode)}
				layout
				transition={{ duration: 0.2, ease: 'linear' }}
			>
				{!isFocusMode && (
					<header className={classes.header}>
						<SearchInput />
						<CreateButton setIsModalVisible={handleCreateNoteClick} text='New note' />
					</header>
				)}
				<main className={classes.notes}>
					{isLoading ? (
						<div className={classes.loaderWrapper}>
							<BeatLoader color='#aaa' size={10} />
						</div>
					) : (
						<>
							{!isFocusMode &&
								(isSearchEmpty ? (
									<div className={classes.emptySearch}>No notes found</div>
								) : (
									<NotesList storageKey='global-notes-collapsed' />
								))}
							<TextEditor key={activeNote?.$id} ref={editorRef} />
							{activeNote && (
								<>
									{!isFocusMode && (
										<button className={classes.deleteButton} onClick={handleDeleteClick}>
											Delete
										</button>
									)}
									<button
										className={classes.undoButton}
										onClick={() => editorRef.current?.undo()}
										title='Undo (Ctrl+Z)'
									>
										<UndoIcon />
									</button>
									<button
										className={clsx(classes.focusButton, isFocusMode && classes.focusButtonActive)}
										onClick={() => toggleFocusMode('generalNotes')}
										title={isFocusMode ? 'Exit focus mode (Esc)' : 'Focus mode (Ctrl+Shift+F)'}
									>
										{isFocusMode ? <MinimizeIcon /> : <ExpandIcon />}
									</button>
								</>
							)}
						</>
					)}
				</main>
			</motion.div>
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
