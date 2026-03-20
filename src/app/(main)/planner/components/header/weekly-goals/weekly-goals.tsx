'use client'

import { useWeeklyGoalsMutations } from '@/shared/hooks/planner/use-weekly-goals-mutations'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { WeeklyGoal } from '@/shared/types/weekly-goal'
import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { EmptyGoalSlot } from './components/empty-goal-slot/empty-goal-slot'
import { WeeklyResetModal } from './components/weekly-reset-modal/weekly-reset-modal'
import classes from './weekly-goals.module.scss'

interface WeeklyGoalsProps {
	goals: WeeklyGoal[]
	onGoalsChange: () => void
}

export const WeeklyGoals = ({ goals, onGoalsChange }: WeeklyGoalsProps) => {
	const [open, setOpen] = useState(false)
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
	} = useWeeklyGoalsMutations({ goals, onSuccess: onGoalsChange })

	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const slots = useMemo(() => {
		return Array.from({ length: 3 }, (_, index) => ({
			index,
			goal: goals.find(g => g.index === index) ?? null,
		}))
	}, [goals])

	return (
		<div ref={dropdownRef} className={clsx(classes.weeklyGoals, open && 'opened')}>
			<button className={classes.trigger} onClick={() => setOpen(prev => !prev)}>
				<span>Weekly goals</span>
				<ArrowBottomIcon />
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						className={classes.dropdown}
						initial={{ opacity: 0, scale: 0.95, y: -6 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.97, y: -4 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}
					>
						{slots.map(({ goal, index }) => {
							if (!goal) {
								return (
									<EmptyGoalSlot key={`empty-${index}`} index={index} onCreate={handleCreate} autoFocus={index === 0} />
								)
							}
							const isEditing = editingGoalId === goal.$id

							if (isEditing) {
								return (
									<input
										key={goal.$id}
										className={classes.inlineEditInput}
										value={editValue}
										autoFocus
										onChange={e => setEditValue(e.target.value)}
										onBlur={saveEdit}
										onKeyDown={e => {
											if (e.key === 'Enter') saveEdit()
											if (e.key === 'Escape') cancelEdit()
										}}
									/>
								)
							}

							return (
								<CheckboxCard
									key={goal.$id}
									withBorder={false}
									label={goal.title}
									checked={goal.isCompleted}
									onCheck={() => handleToggle(goal)}
									onEdit={() => startEdit(goal)}
									withEditing
								/>
							)
						})}
						{goals.length > 0 && (
							<button type='button' className={classes.startNewWeekButton} onClick={() => setIsResetModalOpen(true)}>
								Start new week
							</button>
						)}
						<Modal isVisible={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
							<WeeklyResetModal
								goals={goals}
								onClose={() => setIsResetModalOpen(false)}
								onConfirm={async () => {
									await resetWeek()
									setIsResetModalOpen(false)
								}}
							/>
						</Modal>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
