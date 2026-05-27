'use client'

import { DiaryProvider } from '@/shared/context/diary-context'
import { useDeleteDiaryNote } from '@/shared/hooks/diary/use-delete-diary-note'
import { useFocusMode } from '@/shared/hooks/use-focus-mode/use-focus-mode'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CreateButton } from '@/shared/ui/create-button/create-button'
import { ExpandIcon } from '@/shared/ui/icons/expand-icon'
import { MinimizeIcon } from '@/shared/ui/icons/minimize-icon'
import { UndoIcon } from '@/shared/ui/icons/undo-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor, TextEditorRef } from '@/shared/ui/text-editor/text-editor'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { NewEntryModal } from './components/header/components/new-entry-modal/new-entry-modal'
import { TemplatesDropdown } from './components/header/components/templates-dropdown/templates-dropdown'
import classes from './page.module.scss'

const JournalContent = ({ setIsNewEntryModalOpened }: { setIsNewEntryModalOpened: (v: boolean) => void }) => {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isHydrated, setIsHydrated] = useState(false)

	const editorRef = useRef<TextEditorRef>(null)

	const { isFocusMode, toggleFocusMode } = useFocusMode('journal')
	const { activeNote, isLoading, handleDelete } = useDeleteDiaryNote()

	const handleDeleteClick = () => {
		setIsConfirmOpen(true)
	}

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	if (!isHydrated)
		return (
			<div className={classes.journalPage}>
				<div className={classes.loaderWrapper}>
					<BeatLoader color='#aaa' size={10} />
				</div>
			</div>
		)

	return (
		<>
			<motion.div
				className={clsx(classes.journalPage, isFocusMode && classes.focusMode)}
				layout
				transition={{ duration: 0.2, ease: 'linear' }}
			>
				{!isFocusMode && (
					<header className={classes.header}>
						<CreateButton setIsModalVisible={setIsNewEntryModalOpened} text='New Entry' />
						<TemplatesDropdown />
					</header>
				)}

				<main className={classes.journal}>
					{isLoading ? (
						<div className={classes.loaderWrapper}>
							<BeatLoader color='#aaa' size={10} />
						</div>
					) : (
						<>
							{!isFocusMode && <NotesList storageKey='journal-notes-collapsed' />}
							<TextEditor key={activeNote?.$id || 'empty'} ref={editorRef} />
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
									onClick={() => toggleFocusMode('journal')}
									title={isFocusMode ? 'Exit focus mode (Esc)' : 'Focus mode (Ctrl+Shift+F)'}
								>
									{isFocusMode ? <MinimizeIcon /> : <ExpandIcon />}
								</button>
							)}
						</>
					)}
				</main>
			</motion.div>
			<ConfirmModal
				isVisible={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				onConfirm={handleDelete}
				title='Delete Entry'
				message={
					<>
						Are you sure you want to delete &quot;<span className='highlight'>{activeNote?.title || 'this entry'}</span>
						&quot;?
					</>
				}
			/>
		</>
	)
}

export default function Journal() {
	const [isNewEntryModalOpened, setIsNewEntryModalOpened] = useState(false)
	const { user } = useUser()

	if (!user) {
		return null
	}

	return (
		<DiaryProvider userId={user.$id}>
			<JournalContent setIsNewEntryModalOpened={setIsNewEntryModalOpened} />
			<Modal isVisible={isNewEntryModalOpened} onClose={() => setIsNewEntryModalOpened(false)}>
				<NewEntryModal onClose={() => setIsNewEntryModalOpened(false)} />
			</Modal>
		</DiaryProvider>
	)
}
