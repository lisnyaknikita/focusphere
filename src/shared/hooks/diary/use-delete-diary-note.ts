import { useNotesContext } from '@/shared/context/notes-context'
import { toast } from 'sonner'

export const useDeleteDiaryNote = () => {
	const { activeNote, deleteNote, isLoading } = useNotesContext()

	const handleDelete = async () => {
		if (!activeNote) return

		const deletePromise = deleteNote(activeNote.$id)

		toast.promise(deletePromise, {
			loading: 'Deleting entry...',
			success: 'Entry deleted successfully',
			error: 'Failed to delete entry',
		})

		try {
			await deletePromise
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
