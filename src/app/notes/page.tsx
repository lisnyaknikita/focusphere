'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { useState } from 'react'
import { CreateButton } from './header/create-button/create-button'
import { NewNoteModal } from './header/new-note-modal/new-note-modal'
import classes from './page.module.scss'

export default function Notes() {
	const [isNewNoteModalOpened, setIsNewNoteModalOpened] = useState(false)

	return (
		<>
			<div className={classes.notesPage}>
				<header className={classes.header}>
					<CreateButton setIsNewNoteModalOpened={setIsNewNoteModalOpened} />
				</header>
				<main className={classes.notes}>
					<NotesList />
					{/* <JournalEditor /> */}
				</main>
			</div>
			<Modal isVisible={isNewNoteModalOpened} onClose={() => setIsNewNoteModalOpened(false)}>
				<NewNoteModal />
			</Modal>
		</>
	)
}
