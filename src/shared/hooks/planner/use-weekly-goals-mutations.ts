import { createWeeklyGoal, deleteWeeklyGoal, updateWeeklyGoal } from '@/lib/planner/planner'
import { WeeklyGoal } from '@/shared/types/weekly-goal'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useState } from 'react'

interface UseWeeklyGoalsMutationsProps {
	goals: WeeklyGoal[]
	onSuccess: () => void
}

export const useWeeklyGoalsMutations = ({ goals, onSuccess }: UseWeeklyGoalsMutationsProps) => {
	const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
	const [editValue, setEditValue] = useState('')

	const handleCreate = async (title: string, index: number) => {
		if (!title.trim()) return
		const userId = await getCurrentUserId()

		await createWeeklyGoal({
			title: title.trim(),
			index,
			userId,
			isCompleted: false,
		})
		onSuccess()
	}

	const handleUpdate = async (id: string, data: Partial<WeeklyGoal>) => {
		await updateWeeklyGoal(id, data)
		onSuccess()
	}

	const handleToggle = async (goal: WeeklyGoal) => {
		await handleUpdate(goal.$id, { isCompleted: !goal.isCompleted })
	}

	const startEdit = (goal: WeeklyGoal) => {
		setEditingGoalId(goal.$id)
		setEditValue(goal.title)
	}

	const cancelEdit = () => {
		setEditingGoalId(null)
		setEditValue('')
	}

	const saveEdit = async () => {
		if (!editingGoalId) return

		const title = editValue.trim()
		if (!title) {
			cancelEdit()
			return
		}

		await handleUpdate(editingGoalId, { title })
		cancelEdit()
	}

	const resetWeek = async () => {
		const completed = goals.filter(g => g.isCompleted)
		const pending = goals.filter(g => !g.isCompleted)

		await Promise.all(completed.map(goal => deleteWeeklyGoal(goal.$id)))

		await Promise.all(
			pending.map((goal, index) =>
				updateWeeklyGoal(goal.$id, {
					index,
					isCompleted: false,
				})
			)
		)

		onSuccess()
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
