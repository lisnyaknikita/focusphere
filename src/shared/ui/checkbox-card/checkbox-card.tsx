'use client'

import clsx from 'clsx'
import { DeleteIcon } from '../icons/delete-icon'
import { WeeklyGoalsEditIcon } from '../icons/planner/weekly-goals-edit-icon'
import classes from './checkbox-card.module.scss'

interface CheckboxCardProps {
	label: string
	checked: boolean
	onCheck: (checked: boolean) => void
	onDelete?: () => void
	onEdit?: () => void
	withBorder: boolean
	withRemoval?: boolean
	withEditing?: boolean
}

export function CheckboxCard({
	label,
	checked,
	onCheck,
	onDelete,
	withBorder,
	withRemoval,
	withEditing,
	onEdit,
}: CheckboxCardProps) {
	return (
		<label
			className={clsx(classes.card, checked && 'checked')}
			style={withBorder ? { border: '1px solid var(--btn-border)' } : { border: 'none' }}
		>
			<input type='checkbox' checked={checked} onChange={e => onCheck(e.target.checked)} className={classes.checkbox} />
			<span className={classes.customCheckbox}></span>
			<span className={clsx(classes.label, checked && 'checked')}>{label}</span>
			<div className={classes.buttons}>
				{withEditing ? (
					<button className={classes.editButton} type='button' onClick={onEdit}>
						<WeeklyGoalsEditIcon />
					</button>
				) : null}
				{withRemoval ? (
					<button className={classes.deleteButton} onClick={onDelete && (() => onDelete())}>
						<DeleteIcon />
					</button>
				) : null}
			</div>
		</label>
	)
}
