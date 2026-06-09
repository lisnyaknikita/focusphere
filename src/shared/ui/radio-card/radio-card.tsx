'use client'

import clsx from 'clsx'
import { SoloTypeIcon } from '../icons/projects/solo-type-icon'
import { TeamTypeIcon } from '../icons/projects/team-type-icon'
import classes from './radio-card.module.scss'

interface RadioCardProps {
	value: string
	label: string
	description?: string
	checked: boolean
	name: string
	disabled?: boolean
	isLocked?: boolean
	onChange: (value: string) => void
}

export function RadioCard({
	value,
	label,
	description,
	checked,
	name,
	disabled,
	isLocked = false,
	onChange,
}: RadioCardProps) {
	return (
		<label className={clsx(classes.card, disabled && 'disabled', isLocked && classes.locked)}>
			<input
				type='radio'
				name={name}
				value={value}
				checked={checked}
				disabled={disabled}
				onChange={() => onChange(value)}
				className={classes.radio}
			/>
			<span className={classes.customRadio}></span>
			<div className={classes.info}>
				{value === 'solo' ? <SoloTypeIcon /> : <TeamTypeIcon />}
				<div className={classes.infoText}>
					<div className={classes.labelRow}>
						<span className={classes.label}>{label}</span>
						{isLocked && <span className={classes.proBadge}>PRO</span>}
					</div>
					{description && <span className={classes.description}>{description}</span>}
				</div>
			</div>
		</label>
	)
}
