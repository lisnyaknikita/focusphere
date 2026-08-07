import { BaseNote, ProjectNote } from '@/shared/types/project-note'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { PinIcon } from '@/shared/ui/icons/pin-icon'
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
	allowPinning?: boolean
	onTogglePin?: (note: BaseNote) => void
}

export const NotesListItem = memo(({ note, isActive, onSelect, allowPinning, onTogglePin }: NotesListItemProps) => {
	const { day, number, time } = formatDate(note.$createdAt)
	const previewText = getBlockNotePreview(note.content)

	const handlePinClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		onTogglePin?.(note)
	}

	if (note.isPinned) {
		return (
			<li className={clsx(classes.notesItem, classes.pinnedItem, isActive && classes.active)}>
				<div className={classes.pinnedLink} onClick={() => onSelect(note)}>
					<div className={classes.pinnedTitleGroup}>
						{allowPinning && (
							<ActionTooltip text='Unpin note' placement='right'>
								{(setRef, refProps) => (
									<button
										ref={setRef}
										type='button'
										className={clsx(classes.pinButton, classes.pinnedActive)}
										onClick={handlePinClick}
										{...refProps}
									>
										<PinIcon width={14} height={14} />
									</button>
								)}
							</ActionTooltip>
						)}
						<h4 className={classes.noteTitle} title={note.title}>
							{note.title || 'Untitled Note'}
						</h4>
					</div>
					<time className={classes.pinnedDate}>
						{day}, {number}
					</time>
				</div>
			</li>
		)
	}

	return (
		<li className={clsx(classes.notesItem, isActive && classes.active)}>
			<div className={classes.notesItemLink} onClick={() => onSelect(note)}>
				<div className={classes.date}>
					<span className={classes.day}>{day}</span>
					<span className={classes.number}>{number}</span>
				</div>
				<div className={classes.content}>
					<h4 className={classes.noteTitle} title={note.title}>
						{note.title || 'Untitled note'}
					</h4>
					<h6 className={classes.noteSubtitle}>{previewText}</h6>
					<footer className={classes.notesItemFooter}>
						<time className={classes.noteTime}>{time}</time>
						<div className={classes.badgeAndTooltip}>
							{(note as ProjectNote).linkedTaskCode && <span className={classes.personalBadge}>Personal</span>}
							{allowPinning && (
								<ActionTooltip text='Pin note' placement='left'>
									{(setRef, refProps) => (
										<button
											ref={setRef}
											type='button'
											className={classes.pinButton}
											onClick={handlePinClick}
											{...refProps}
										>
											<PinIcon width={14} height={14} />
										</button>
									)}
								</ActionTooltip>
							)}
						</div>
					</footer>
				</div>
			</div>
		</li>
	)
})

NotesListItem.displayName = 'NotesListItem'
