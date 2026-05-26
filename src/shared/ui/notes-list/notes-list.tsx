import { useNotesContext } from '@/shared/context/notes-context'
import { ProjectNote } from '@/shared/types/project-note'
import { getBlockNotePreview } from '@/shared/utils/get-blocknote-preview/get-blocknote-preview'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { SidebarIcon } from '../icons/sidebar-icon'
import classes from './notes-list.module.scss'

interface NotesListProps {
	withTitle?: boolean
	withTags?: boolean
	storageKey: string
}

export const NotesList = ({ withTitle, withTags, storageKey }: NotesListProps) => {
	const [isCollapsed, setIsCollapsed] = useState(true)
	const { notes, activeNote, setActiveNote, headerTitle, isLoading } = useNotesContext()

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

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return {
			day: date.toLocaleDateString('en-US', { weekday: 'short' }),
			number: date.getDate().toString().padStart(2, '0'),
			time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
		}
	}

	return (
		<div className={clsx(classes.listWrapper, withTags && 'withTags', isCollapsed && 'collapsed')}>
			<div className={classes.drawerContent}>
				{withTitle && !isCollapsed && <h3 className={classes.title}>{headerTitle}</h3>}
				<ul className={clsx(classes.notesList, withTitle && 'withTitle', isCollapsed && 'collapsed')}>
					{!isLoading && notes.length === 0 && !isCollapsed && (
						<p className={classes.noNotesMessage}>No entries here</p>
					)}
					{!isCollapsed &&
						notes.map(note => {
							const { day, number, time } = formatDate(note.$createdAt)
							const previewText = getBlockNotePreview(note.content)
							return (
								<li
									key={note.$id}
									className={clsx(classes.notesItem, activeNote?.$id === note.$id && 'active')}
									onClick={() => {
										setActiveNote(note)
										if (window.innerWidth <= 630) setIsCollapsed(true)
									}}
								>
									<a href='#' className={classes.notesItemLink}>
										<div className={classes.date}>
											<span className={classes.day}>{day}</span>
											<span className={classes.number}>{number}</span>
										</div>
										<div className={classes.content}>
											<h4 className={classes.noteTitle} title={note.title}>
												{note.title}
											</h4>
											<h6 className={classes.noteSubtitle}>{previewText}</h6>
											<footer className={classes.notesItemFooter}>
												<time className={classes.noteTime}>{time}</time>
												{(note as ProjectNote).linkedTaskCode && (
													<span className={classes.personalBadge}>Personal</span>
												)}
											</footer>
										</div>
									</a>
								</li>
							)
						})}
				</ul>
				<button className={classes.sidebarButton} onClick={toggleCollapsed}>
					<SidebarIcon />
				</button>
			</div>
		</div>
	)
}
