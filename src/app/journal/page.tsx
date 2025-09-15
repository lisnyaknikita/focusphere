'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { useState } from 'react'
import { CreateButton } from './header/components/create-button/create-button'
import { NewEntryModal } from './header/components/new-entry-modal/new-entry-modal'
import { TemplatesDropdown } from './header/components/templates-dropdown/templates-dropdown'
import classes from './page.module.scss'

export default function Journal() {
	const [isNewEntryModalOpened, setIsNewEntryModalOpened] = useState(false)

	return (
		<>
			<div className={classes.journalPage}>
				<header className={classes.header}>
					<CreateButton setIsNewEntryModalOpened={setIsNewEntryModalOpened} />
					<TemplatesDropdown />
				</header>
				<main className={classes.journal}>
					<NotesList />
				</main>
			</div>
			<Modal isVisible={isNewEntryModalOpened} onClose={() => setIsNewEntryModalOpened(false)}>
				<NewEntryModal />
			</Modal>
		</>
	)
}
