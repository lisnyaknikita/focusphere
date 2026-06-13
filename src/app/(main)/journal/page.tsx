'use client'

import { DiaryProvider } from '@/shared/context/diary-context'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { Modal } from '@/shared/ui/modal/modal'
import { useState } from 'react'
import { NewEntryModal } from './components/header/components/new-entry-modal/new-entry-modal'
import { JournalContent } from './components/journal-content/journal-content'

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
