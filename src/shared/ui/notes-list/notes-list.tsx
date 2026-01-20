import { useProject } from '@/shared/context/project-context'
import { stripHtml } from '@/shared/utils/strip-html/strip-html'
import clsx from 'clsx'
import classes from './notes-list.module.scss'

interface NotesListProps {
	withTitle?: boolean
	withTags?: boolean
}

export const NotesList = ({ withTitle, withTags }: NotesListProps) => {
	const { notes, activeNote, setActiveNote, project } = useProject()

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return {
			day: date.toLocaleDateString('en-US', { weekday: 'short' }),
			number: date.getDate().toString().padStart(2, '0'),
			time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
		}
	}

	return (
		<div className={clsx(classes.listWrapper, withTags && 'withTags')}>
			{withTitle && <h3 className={classes.title}>{project?.title}</h3>}
			<ul className={clsx(classes.notesList, withTitle && 'withTitle')}>
				{notes.length === 0 && project && <p className={classes.noNotesMessage}>No notes here</p>}
				{notes.map(note => {
					const { day, number, time } = formatDate(note.$createdAt)
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
								<div className={classes.content}>
									<h4 className={classes.noteTitle}>{note.title}</h4>
									<h6 className={classes.noteSubtitle}>{stripHtml(note.content)}</h6>
									<time className={classes.noteTime}>{time}</time>
								</div>
							</a>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
