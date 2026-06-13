import { BaseNote, ProjectNote } from '@/shared/types/project-note'
import { getBlockNotePreview } from '@/shared/utils/get-blocknote-preview/get-blocknote-preview'
import clsx from 'clsx'
import { memo } from 'react'
import classes from './notes-list-item.module.scss'

const formatDate = (dateString: string) => {
	const date = new Date(dateString)

	return {
		day: date.toLocaleDateString('en-US', { weekday: 'short' }),
		number: date.getDate().toString().padStart(2, '0'),
		time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
	}
}

interface NotesListItemProps {
	note: BaseNote
	isActive: boolean
	onSelect: (note: BaseNote) => void
}

export const NotesListItem = memo(({ note, isActive, onSelect }: NotesListItemProps) => {
	const { day, number, time } = formatDate(note.$createdAt)
	const previewText = getBlockNotePreview(note.content)

	return (
		<li className={clsx(classes.notesItem, isActive && 'active')}>
			<button className={classes.notesItemLink} onClick={() => onSelect(note)}>
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
						{(note as ProjectNote).linkedTaskCode && <span className={classes.personalBadge}>Personal</span>}
					</footer>
				</div>
			</button>
		</li>
	)
})

NotesListItem.displayName = 'NotesListItem'
