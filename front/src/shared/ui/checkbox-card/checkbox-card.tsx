'use client'

import classes from './checkbox-card.module.scss'

interface CheckboxCardProps {
	label: string
	checked: boolean
	onCheck: (checked: boolean) => void
	withBorder: boolean
}

export function CheckboxCard({ label, checked, onCheck, withBorder }: CheckboxCardProps) {
	return (
		<label className={classes.card} style={withBorder ? { border: '1px solid var(--btn-border)' } : { border: 'none' }}>
			<input type='checkbox' checked={checked} onChange={e => onCheck(e.target.checked)} className={classes.checkbox} />
			<span className={classes.customCheckbox}></span>
			<span className={classes.label}>{label}</span>
		</label>
	)
}
