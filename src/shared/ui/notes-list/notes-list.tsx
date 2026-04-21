import { useNotesContext } from '@/shared/context/notes-context'
import { getBlockNotePreview } from '@/shared/utils/get-blocknote-preview/get-blocknote-preview'
import clsx from 'clsx'
import { useState } from 'react'
import { SidebarIcon } from '../icons/sidebar-icon'
import classes from './notes-list.module.scss'

interface NotesListProps {
	withTitle?: boolean
	withTags?: boolean
}

const COLLAPSED_KEY = 'notes-list-collapsed'

export const NotesList = ({ withTitle, withTags }: NotesListProps) => {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		try {
			return localStorage.getItem(COLLAPSED_KEY) === 'true'
		} catch {
			return false
		}
	})
	const { notes, activeNote, setActiveNote, headerTitle, isLoading } = useNotesContext()

	const toggleCollapsed = () => {
		setIsCollapsed(prev => {
			const next = !prev
			try {
				localStorage.setItem(COLLAPSED_KEY, String(next))
			} catch {}
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
		<div
			className={clsx(
				classes.listWrapper,
				withTags && 'withTags',
				isCollapsed && 'collapsed',
				isCollapsed && !isLoading && notes.length === 0 && 'empty'
			)}
		>
			{withTitle && <h3 className={classes.title}>{headerTitle}</h3>}
			<ul className={clsx(classes.notesList, withTitle && 'withTitle', isCollapsed && 'collapsed')}>
				{!isLoading && notes.length === 0 && !isCollapsed && <p className={classes.noNotesMessage}>No entries here</p>}
				{notes.map(note => {
					const { day, number, time } = formatDate(note.$createdAt)
					const previewText = getBlockNotePreview(note.content)
					return (
						<li
							key={note.$id}
							className={clsx(classes.notesItem, activeNote?.$id === note.$id && 'active')}
							onClick={() => setActiveNote(note)}
						>
							<a href='#' className={classes.notesItemLink}>
								<div className={classes.date}>
									<span className={classes.day}>{day}</span>
									<span className={classes.number}>{number}</span>
								</div>
								{!isCollapsed && (
									<div className={classes.content}>
										<h4 className={classes.noteTitle} title={note.title}>
											{note.title}
										</h4>
										<h6 className={classes.noteSubtitle}>{previewText}</h6>
										<time className={classes.noteTime}>{time}</time>
									</div>
								)}
							</a>
						</li>
					)
				})}
			</ul>
			<button className={classes.sidebarButton} onClick={toggleCollapsed}>
				<SidebarIcon />
			</button>
		</div>
	)
}
