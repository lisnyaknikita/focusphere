import clsx from 'clsx'
import classes from './notes-list.module.scss'

interface NotesListProps {
	withTitle?: boolean
	withTags?: boolean
}

export const NotesList = ({ withTitle, withTags }: NotesListProps) => {
	return (
		<div className={clsx(classes.listWrapper, withTags && 'withTags')}>
			{withTitle && <h3 className={classes.title}>Website redesign</h3>}
			<ul className={classes.notesList}>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
				<li className={classes.notesItem}>
					<a href='#' className={classes.notesItemLink}>
						<div className={classes.date}>
							<span className={classes.day}>Wed</span>
							<span className={classes.number}>03</span>
						</div>
						<div className={classes.content}>
							<h4 className={classes.noteTitle}>Project team</h4>
							<h6 className={classes.noteSubtitle}>
								I am so tired is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							</h6>
							<time className={classes.noteTime}>09:31 AM</time>
						</div>
					</a>
				</li>
			</ul>
		</div>
	)
}
