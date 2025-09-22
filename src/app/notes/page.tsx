'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { CreateButton } from './header/create-button/create-button'
import { NewNoteModal } from './header/new-note-modal/new-note-modal'
import classes from './page.module.scss'

const TextEditor = dynamic(() => import('../../shared/ui/text-editor/text-editor').then(m => m.TextEditor), {
	ssr: false,
})

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
					<TextEditor />
				</main>
			</div>
			<Modal isVisible={isNewNoteModalOpened} onClose={() => setIsNewNoteModalOpened(false)}>
				<NewNoteModal />
			</Modal>
		</>
	)
}
