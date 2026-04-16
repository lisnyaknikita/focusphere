import { useProject } from '@/shared/context/project-context'
import { toast } from 'sonner'

export const useDeleteNote = () => {
	const { activeNote, deleteNote, isNotesLoading, handleContentChange } = useProject()

	const handleDelete = async () => {
		if (!activeNote) return

		const deletePromise = deleteNote(activeNote.$id)

		toast.promise(deletePromise, {
			loading: 'Deleting note...',
			success: 'Note deleted successfully',
			error: 'Failed to delete note',
		})

		try {
			await deletePromise
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
