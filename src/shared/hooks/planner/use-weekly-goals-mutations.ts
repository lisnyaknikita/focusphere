import { createWeeklyGoal, deleteWeeklyGoal, updateWeeklyGoal } from '@/lib/planner/planner'
import { WeeklyGoal } from '@/shared/types/weekly-goal'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface UseWeeklyGoalsMutationsProps {
	goals: WeeklyGoal[]
	onSuccess: () => void
}

export const useWeeklyGoalsMutations = ({ goals, onSuccess }: UseWeeklyGoalsMutationsProps) => {
	const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
	const [editValue, setEditValue] = useState('')

	const isCancelingRef = useRef(false)

	const handleCreate = async (title: string, index: number) => {
		if (!title.trim()) return
		try {
			const userId = await getCurrentUserId()

			await createWeeklyGoal({
				title: title.trim(),
				index,
				userId,
				isCompleted: false,
			})
			toast.success('Goal added')
			onSuccess()
		} catch (error) {
			console.error('Failed to create goal:', error)
			toast.error('Failed to add goal')
		}
	}

	const handleUpdate = async (id: string, data: Partial<WeeklyGoal>) => {
		try {
			await updateWeeklyGoal(id, data)
			onSuccess()
		} catch (error) {
			console.error('Failed to update goal:', error)
			toast.error('Failed to save changes')
		}
	}

	const handleToggle = async (goal: WeeklyGoal) => {
		await handleUpdate(goal.$id, { isCompleted: !goal.isCompleted })
	}

	const startEdit = (goal: WeeklyGoal) => {
		isCancelingRef.current = false
		setEditingGoalId(goal.$id)
		setEditValue(goal.title)
	}

	const cancelEdit = () => {
		isCancelingRef.current = true
		setEditingGoalId(null)
		setEditValue('')
	}

	const saveEdit = async () => {
		if (isCancelingRef.current || !editingGoalId) return

		const title = editValue.trim()

		if (!title) {
			cancelEdit()
			return
		}

		await handleUpdate(editingGoalId, { title })
		setEditingGoalId(null)
		setEditValue('')
	}

	const resetWeek = async () => {
		const completed = goals.filter(g => g.isCompleted)
		const pending = goals.filter(g => !g.isCompleted)

		const resetPromise = (async () => {
			await Promise.all(completed.map(goal => deleteWeeklyGoal(goal.$id)))

			await Promise.all(
				pending.map((goal, index) =>
					updateWeeklyGoal(goal.$id, {
						index,
						isCompleted: false,
					})
				)
			)
		})()

		toast.promise(resetPromise, {
			loading: 'Resetting week...',
			success: 'Week reset successfully',
			error: 'Failed to reset week',
		})

		try {
			await resetPromise
			onSuccess()
		} catch (error) {
			console.error('Reset error:', error)
		}
	}

	return {
		editingGoalId,
		editValue,
		setEditValue,
		startEdit,
		cancelEdit,
		saveEdit,
		handleCreate,
		handleUpdate,
		handleToggle,
		resetWeek,
	}
}
