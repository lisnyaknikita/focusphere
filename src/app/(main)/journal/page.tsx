'use client'

import { DiaryProvider } from '@/shared/context/diary-context'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import { useState } from 'react'
import { CreateButton } from './components/header/components/create-button/create-button'
import { NewEntryModal } from './components/header/components/new-entry-modal/new-entry-modal'
import { TemplatesDropdown } from './components/header/components/templates-dropdown/templates-dropdown'
import classes from './page.module.scss'

export default function Journal() {
	const [isNewEntryModalOpened, setIsNewEntryModalOpened] = useState(false)
	const { user } = useUser()

	if (!user) {
		return null
	}

	return (
		<DiaryProvider userId={user.$id}>
			<div className={classes.journalPage}>
				<header className={classes.header}>
					<CreateButton setIsNewEntryModalOpened={setIsNewEntryModalOpened} />
					<TemplatesDropdown />
				</header>
				<main className={classes.journal}>
					<NotesList />
					<TextEditor />
				</main>
			</div>
			<Modal isVisible={isNewEntryModalOpened} onClose={() => setIsNewEntryModalOpened(false)}>
				<NewEntryModal onClose={() => setIsNewEntryModalOpened(false)} />
			</Modal>
		</DiaryProvider>
	)
}
