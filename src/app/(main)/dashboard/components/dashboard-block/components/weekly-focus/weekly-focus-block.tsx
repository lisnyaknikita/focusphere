'use client'

import { EmptyGoalSlot } from '@/app/(main)/planner/components/header/weekly-goals/components/empty-goal-slot/empty-goal-slot'
import { WeeklyResetModal } from '@/app/(main)/planner/components/header/weekly-goals/components/weekly-reset-modal/weekly-reset-modal'
import { useWeeklyGoals } from '@/shared/hooks/planner/use-weekly-goals'
import { useWeeklyGoalsMutations } from '@/shared/hooks/planner/use-weekly-goals-mutations'
import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import { Modal } from '@/shared/ui/modal/modal'
import { useMemo, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './weekly-focus-block.module.scss'

export const WeeklyFocusBlock = () => {
	const { weeklyGoals, isLoading, refreshWeeklyGoals } = useWeeklyGoals()
	const [isResetModalOpen, setIsResetModalOpen] = useState(false)

	const {
		editingGoalId,
		editValue,
		setEditValue,
		startEdit,
		cancelEdit,
		saveEdit,
		handleCreate,
		handleToggle,
		resetWeek,
	} = useWeeklyGoalsMutations({ goals: weeklyGoals, onSuccess: refreshWeeklyGoals })

	const slots = useMemo(() => {
		return Array.from({ length: 3 }, (_, index) => ({
			index,
			goal: weeklyGoals.find(g => g.index === index) ?? null,
		}))
	}, [weeklyGoals])

	const completedCount = useMemo(() => weeklyGoals.filter(g => g.isCompleted).length, [weeklyGoals])

	const progressPercent = useMemo(() => {
		if (!weeklyGoals.length) return 0
		return Math.round((completedCount / weeklyGoals.length) * 100)
	}, [completedCount, weeklyGoals.length])

	return (
		<>
			<section className={classes.weeklyFocus}>
				<div className={classes.header}>
					<div className={classes.titleGroup}>
						<h2 className={classes.title}>Weekly Focus</h2>
						<span className={classes.badge}>
							{completedCount} of {weeklyGoals.length}
						</span>
					</div>
					{weeklyGoals.length > 0 && (
						<button type='button' className={classes.resetBtn} onClick={() => setIsResetModalOpen(true)}>
							Start new week
						</button>
					)}
				</div>

				<div className={classes.progressBarTrack}>
					<div className={classes.progressBarFill} style={{ width: `${progressPercent}%` }} />
				</div>

				<div className={classes.slotsList}>
					{isLoading ? (
						<div className={classes.loaderContainer}>
							<BeatLoader color='#aaa' size={10} />
						</div>
					) : (
						slots.map(({ goal, index }) => {
							if (!goal) {
								return (
									<EmptyGoalSlot
										key={`empty-${index}`}
										index={index}
										onCreate={handleCreate}
										autoFocus={weeklyGoals.length === 0 && index === 0}
									/>
								)
							}

							const isEditing = editingGoalId === goal.$id

							if (isEditing) {
								return (
									<div key={goal.$id} className={classes.inlineEditWrapper}>
										<input
											className={classes.inlineInput}
											value={editValue}
											autoFocus
											onChange={e => setEditValue(e.target.value)}
											onBlur={saveEdit}
											onKeyDown={e => {
												if (e.key === 'Enter') saveEdit()
												if (e.key === 'Escape') cancelEdit()
											}}
										/>
									</div>
								)
							}

							return (
								<CheckboxCard
									key={goal.$id}
									withBorder={true}
									label={goal.title}
									checked={goal.isCompleted}
									onCheck={() => handleToggle(goal)}
									onEdit={() => startEdit(goal)}
									withEditing
									lineClamp={1}
								/>
							)
						})
					)}
				</div>
			</section>

			<Modal isVisible={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
				<WeeklyResetModal
					goals={weeklyGoals}
					onClose={() => setIsResetModalOpen(false)}
					onConfirm={async () => {
						await resetWeek()
						setIsResetModalOpen(false)
					}}
				/>
			</Modal>
		</>
	)
}
