import { useNotesContext } from '@/shared/context/notes-context'

export const useDeleteDiaryNote = () => {
	const { activeNote, deleteNote, isLoading } = useNotesContext()

	const onDelete = async () => {
		if (!activeNote) return

		const confirmed = window.confirm(`Are you sure you want to delete "${activeNote.title}"?`)

		if (confirmed) {
			try {
				await deleteNote(activeNote.$id)
			} catch (error) {
				console.error('Failed to delete diary note:', error)
			}
		}
	}

	return {
		activeNote,
		isLoading,
		onDelete,
	}
}
