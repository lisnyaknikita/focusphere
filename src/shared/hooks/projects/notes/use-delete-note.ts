import { useProject } from '@/shared/context/project-context'

export const useDeleteNote = () => {
	const { activeNote, deleteNote, isNotesLoading, handleContentChange } = useProject()

	const handleDelete = async () => {
		if (!activeNote) return
		try {
			await deleteNote(activeNote.$id)
		} catch (error) {
			console.error('Failed to delete note:', error)
		}
	}

	return {
		activeNote,
		isNotesLoading,
		handleDelete,
		handleContentChange,
	}
}
