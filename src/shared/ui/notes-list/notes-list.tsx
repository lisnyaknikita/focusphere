import { useNotesContext } from '@/shared/context/notes-context'
import { BaseNote } from '@/shared/types/project-note'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SidebarIcon } from '../icons/sidebar-icon'
import { NotesListItem } from './components/notes-list-item/notes-list-item'
import classes from './notes-list.module.scss'

interface NotesListProps {
	storageKey: string
	allowPinning?: boolean
}

export const NotesList = ({ storageKey, allowPinning }: NotesListProps) => {
	const [isCollapsed, setIsCollapsed] = useState(true)
	const { notes, activeNote, setActiveNote, isLoading, togglePinNote } = useNotesContext()

	useEffect(() => {
		const saved = localStorage.getItem(storageKey)
		const isMobile = window.innerWidth <= 630

		if (isMobile) {
			setIsCollapsed(true)
		} else {
			setIsCollapsed(saved === 'true')
		}
	}, [storageKey])

	const toggleCollapsed = () => {
		setIsCollapsed(prev => {
			const next = !prev
			if (window.innerWidth > 630) {
				try {
					localStorage.setItem(storageKey, String(next))
				} catch {}
			}
			return next
		})
	}

	const handleSelectNote = useCallback(
		(note: BaseNote) => {
			setActiveNote(note)
			if (window.innerWidth <= 630) {
				setIsCollapsed(true)
			}
		},
		[setActiveNote]
	)

	const handleTogglePin = useCallback(
		async (note: BaseNote) => {
			if (!togglePinNote) return
			try {
				await togglePinNote(note.$id)
			} catch (err) {
				console.error('Failed to toggle pin:', err)
			}
		},
		[togglePinNote]
	)

	const sortedNotes = useMemo(() => {
		if (!allowPinning) return notes

		return [...notes].sort((a, b) => {
			if (!!a.isPinned === !!b.isPinned) return 0
			return a.isPinned ? -1 : 1
		})
	}, [notes, allowPinning])

	return (
		<div className={clsx(classes.listWrapper, isCollapsed && 'collapsed')}>
			<div className={classes.drawerContent}>
				<ul className={clsx(classes.notesList, isCollapsed && 'collapsed')}>
					{!isLoading && notes.length === 0 && !isCollapsed && (
						<p className={classes.noNotesMessage}>No entries here</p>
					)}
					{!isCollapsed && (
						<AnimatePresence mode='popLayout'>
							{sortedNotes.map(note => (
								<motion.div key={note.$id} layout transition={{ type: 'spring', stiffness: 500, damping: 40 }}>
									<NotesListItem
										note={note}
										isActive={activeNote?.$id === note.$id}
										onSelect={handleSelectNote}
										allowPinning={allowPinning}
										onTogglePin={handleTogglePin}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					)}
				</ul>
				<button className={classes.sidebarButton} onClick={toggleCollapsed}>
					<SidebarIcon />
				</button>
			</div>
		</div>
	)
}
