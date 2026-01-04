import { WeeklyGoal } from '@/shared/types/weekly-goal'
import classes from './weekly-reset-modal.module.scss'

interface WeeklyResetModalProps {
	goals: WeeklyGoal[]
	onClose: () => void
	onConfirm: () => void
}

export const WeeklyResetModal = ({ goals, onClose, onConfirm }: WeeklyResetModalProps) => {
	const completed = goals.filter(g => g.isCompleted)
	const pending = goals.filter(g => !g.isCompleted)

	return (
		<div className={classes.modalInner}>
			<h2>Start a new week</h2>
			{completed.length > 0 && (
				<>
					<h3 className={classes.innerTitle}>Completed goals(will be removed):</h3>
					<ul className={classes.goalsList}>
						{completed.map(goal => (
							<li key={goal.$id}>✅ {goal.title}</li>
						))}
					</ul>
				</>
			)}
			{pending.length > 0 && (
				<>
					<h3 className={classes.innerTitle}>Carried over:</h3>
					<ul className={classes.goalsList}>
						{pending.map(goal => (
							<li key={goal.$id}>❌ {goal.title}</li>
						))}
					</ul>
				</>
			)}
			<div className={classes.actionButtons}>
				<button onClick={onConfirm} className={classes.confirmButton}>
					Start new week
				</button>
				<button onClick={onClose} className={classes.cancelButton}>
					Cancel
				</button>
			</div>
		</div>
	)
}
