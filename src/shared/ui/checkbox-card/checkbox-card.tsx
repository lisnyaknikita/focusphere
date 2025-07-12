'use client'

import classes from './checkbox-card.module.scss'

interface CheckboxCardProps {
	label: string
	checked: boolean
	onCheck: (checked: boolean) => void
}

export function CheckboxCard({ label, checked, onCheck }: CheckboxCardProps) {
	return (
		<label className={classes.card}>
			<input type='checkbox' checked={checked} onChange={e => onCheck(e.target.checked)} className={classes.checkbox} />
			<span className={classes.customCheckbox}></span>
			<span className={classes.label}>{label}</span>
		</label>
	)
}
