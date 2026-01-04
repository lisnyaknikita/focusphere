import { useState } from 'react'
import classes from './empty-goal-slot.module.scss'

interface EmptyGoalSlotProps {
	index: number
	onCreate: (title: string, index: number) => void
	autoFocus?: boolean
}

export const EmptyGoalSlot = ({ index, onCreate, autoFocus }: EmptyGoalSlotProps) => {
	const [goalTitle, setGoalTitle] = useState('')

	const handleCreateGoal = () => {
		const title = goalTitle.trim()
		if (!title) return

		onCreate(title, index)
		setGoalTitle('')
	}

	return (
		<div className={classes.emptySlot}>
			<input
				autoFocus={autoFocus}
				className={classes.inlineInput}
				placeholder='Enter your weekly goal'
				value={goalTitle}
				onChange={e => setGoalTitle(e.target.value)}
				onBlur={handleCreateGoal}
				onKeyDown={e => {
					if (e.key === 'Enter') handleCreateGoal()
					if (e.key === 'Escape') setGoalTitle('')
				}}
			/>
		</div>
	)
}
