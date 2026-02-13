import { useNotesContext } from '@/shared/context/notes-context'

export const useDeleteDiaryNote = () => {
	const { activeNote, deleteNote, isLoading } = useNotesContext()

	const handleDelete = async () => {
		if (!activeNote) return
		try {
			await deleteNote(activeNote.$id)
		} catch (error) {
			console.error('Failed to delete diary note:', error)
		}
	}

	return {
		activeNote,
		isLoading,
		handleDelete,
	}
}
