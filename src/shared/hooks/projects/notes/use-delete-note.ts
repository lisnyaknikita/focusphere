import { useProject } from '@/shared/context/project-context'

export const useDeleteNote = () => {
	const { activeNote, deleteNote, isNotesLoading, handleContentChange } = useProject()

	const onDelete = async () => {
		if (!activeNote) return

		const confirmed = window.confirm(`Are you sure you want to delete "${activeNote.title}"?`)

		if (confirmed) {
			try {
				await deleteNote(activeNote.$id)
			} catch (error) {
				console.error('Failed to delete note:', error)
			}
		}
	}

	return {
		activeNote,
		isNotesLoading,
		onDelete,
		handleContentChange,
	}
}
