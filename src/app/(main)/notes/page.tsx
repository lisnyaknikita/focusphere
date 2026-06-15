'use client'

import { GeneralNotesProvider } from '@/shared/context/general-notes-context'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { NewNoteModal } from './components/header/new-note-modal/new-note-modal'
import { NotesContent } from './components/notes-content/notes-content'

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
