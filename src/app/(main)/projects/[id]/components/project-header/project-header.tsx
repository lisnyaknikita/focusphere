'use client'

import { NewNoteModal } from '@/app/(main)/notes/components/header/new-note-modal/new-note-modal'
import { Modal } from '@/shared/ui/modal/modal'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ProjectTabs } from '../tabs/tabs'
import { CreateButton } from './components/create-note-button/create-note-button'
import classes from './project-header.module.scss'

export const ProjectHeader = ({ projectId }: { projectId: string }) => {
	const [isNewNoteModalOpened, setIsNewNoteModalOpened] = useState(false)

	const pathName = usePathname()

	const isNotesTab = pathName.endsWith('/notes')

	return (
		<>
			<header className={classes.header}>
				<ProjectTabs projectId={projectId} />
				{isNotesTab && <CreateButton setIsNewNoteModalOpened={setIsNewNoteModalOpened} />}
			</header>
			<Modal isVisible={isNewNoteModalOpened} onClose={() => setIsNewNoteModalOpened(false)}>
				<NewNoteModal onClose={() => setIsNewNoteModalOpened(false)} />
			</Modal>
		</>
	)
}
