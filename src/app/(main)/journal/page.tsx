'use client'

import { DiaryProvider } from '@/shared/context/diary-context'
import { useDeleteDiaryNote } from '@/shared/hooks/diary/use-delete-diary-note'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CreateButton } from '@/shared/ui/create-button/create-button'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { NewEntryModal } from './components/header/components/new-entry-modal/new-entry-modal'
import { TemplatesDropdown } from './components/header/components/templates-dropdown/templates-dropdown'
import classes from './page.module.scss'

const JournalContent = ({ setIsNewEntryModalOpened }: { setIsNewEntryModalOpened: (v: boolean) => void }) => {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)

	const { activeNote, isLoading, handleDelete } = useDeleteDiaryNote()

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'left',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const handleDeleteClick = () => {
		setIsConfirmOpen(true)
		setIsTooltipOpen(false)
	}

	return (
		<>
			<div className={classes.journalPage}>
				<header className={classes.header}>
					<CreateButton setIsModalVisible={setIsNewEntryModalOpened} text='New Entry' />
					<TemplatesDropdown />
				</header>

				<main className={classes.journal}>
					{isLoading ? (
						<div className={classes.loaderWrapper}>
							<BeatLoader color='#aaa' size={10} />
						</div>
					) : (
						<>
							<NotesList />
							<TextEditor key={activeNote?.$id || 'empty'} />

							{activeNote && (
								<button
									ref={refs.setReference}
									className={classes.deleteButton}
									onClick={handleDeleteClick}
									disabled={!activeNote}
									{...getReferenceProps()}
								>
									<DeleteIcon />
									{isTooltipOpen && (
										<div
											ref={refs.setFloating}
											style={{
												...floatingStyles,
												background: 'var(--save-button-bg)',
												color: 'var(--save-button-text)',
												padding: '4px 8px',
												borderRadius: '5px',
												fontSize: '13px',
												fontWeight: 700,
												zIndex: 1000,
												whiteSpace: 'nowrap',
											}}
											{...getFloatingProps()}
										>
											Delete entry
										</div>
									)}
								</button>
							)}
						</>
					)}
				</main>
			</div>
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
