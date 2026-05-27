'use client'

import { useDeleteNote } from '@/shared/hooks/projects/notes/use-delete-note'
import { useFocusMode } from '@/shared/hooks/use-focus-mode/use-focus-mode'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { ExpandIcon } from '@/shared/ui/icons/expand-icon'
import { MinimizeIcon } from '@/shared/ui/icons/minimize-icon'
import { UndoIcon } from '@/shared/ui/icons/undo-icon'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor, TextEditorRef } from '@/shared/ui/text-editor/text-editor'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './page.module.scss'

export default function NotesPage() {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isHydrated, setIsHydrated] = useState(false)

	const editorRef = useRef<TextEditorRef>(null)

	const { isFocusMode, toggleFocusMode } = useFocusMode('projectNotes')
	const { activeNote, isNotesLoading, handleDelete } = useDeleteNote()

	const handleDeleteClick = () => {
		setIsConfirmOpen(true)
	}

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	if (!isHydrated)
		return (
			<div className={classes.notesPage}>
				<div className={classes.inner}>
					<BeatLoader color='#aaa' size={10} className={classes.loader} />
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
				<div className={classes.inner}>
					{isNotesLoading ? (
						<BeatLoader color='#aaa' size={10} className={classes.loader} />
					) : (
						<>
							{!isFocusMode && <NotesList withTitle={false} withTags={true} storageKey='project-notes-collapsed' />}
							<TextEditor key={activeNote?.$id} ref={editorRef} />
							{activeNote && !isFocusMode && (
								<button className={classes.deleteButton} onClick={handleDeleteClick} disabled={!activeNote}>
									Delete
								</button>
							)}
							{activeNote && (
								<button className={classes.undoButton} onClick={() => editorRef.current?.undo()} title='Undo (Ctrl+Z)'>
									<UndoIcon />
								</button>
							)}
							{activeNote && (
								<button
									className={clsx(classes.focusButton, isFocusMode && classes.focusButtonActive)}
									onClick={() => toggleFocusMode('projectNotes')}
									title={isFocusMode ? 'Exit focus mode (Esc)' : 'Focus mode (Ctrl+Shift+F)'}
								>
									{isFocusMode ? <MinimizeIcon /> : <ExpandIcon />}
								</button>
							)}
						</>
					)}
				</div>
			</motion.div>
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
