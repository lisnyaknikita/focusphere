import { NotesList } from '@/shared/ui/notes-list/notes-list'
import { TextEditor } from '@/shared/ui/text-editor/text-editor'
import { Tags } from './components/tags/tags'
import classes from './page.module.scss'

export default function NotesPage() {
	return (
		<div className={classes.notesPage}>
			<div className={classes.inner}>
				<NotesList withTitle={true} withTags={true} />
				<TextEditor />
				<Tags />
			</div>
		</div>
	)
}
