import { useNotesContext } from '@/shared/context/notes-context'
import { BaseNote } from '@/shared/types/project-note'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { SidebarIcon } from '../icons/sidebar-icon'
import { NotesListItem } from './components/notes-list-item/notes-list-item'
import classes from './notes-list.module.scss'

interface NotesListProps {
	storageKey: string
}

export const NotesList = ({ storageKey }: NotesListProps) => {
	const [isCollapsed, setIsCollapsed] = useState(true)
	const { notes, activeNote, setActiveNote, isLoading } = useNotesContext()

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

	return (
		<div className={clsx(classes.listWrapper, isCollapsed && 'collapsed')}>
			<div className={classes.drawerContent}>
				<ul className={clsx(classes.notesList, isCollapsed && 'collapsed')}>
					{!isLoading && notes.length === 0 && !isCollapsed && (
						<p className={classes.noNotesMessage}>No entries here</p>
					)}
					{!isCollapsed &&
						notes.map(note => (
							<NotesListItem
								key={note.$id}
								note={note}
								isActive={activeNote?.$id === note.$id}
								onSelect={handleSelectNote}
							/>
						))}
				</ul>
				<button className={classes.sidebarButton} onClick={toggleCollapsed}>
					<SidebarIcon />
				</button>
			</div>
		</div>
	)
}
