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
	preventLineThrough?: boolean
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
	preventLineThrough,
}: CheckboxCardProps) {
	const shouldApplyCheckedClass = checked && !preventLineThrough

	return (
		<label
			title={label}
			className={clsx(classes.card, shouldApplyCheckedClass && 'checked')}
			style={withBorder ? { border: '1px solid var(--btn-border)' } : { border: 'none' }}
		>
			<input type='checkbox' checked={checked} onChange={e => onCheck(e.target.checked)} className={classes.checkbox} />
			<span className={classes.customCheckbox}></span>
			<span className={clsx(classes.label, shouldApplyCheckedClass && 'checked')}>{label}</span>
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
