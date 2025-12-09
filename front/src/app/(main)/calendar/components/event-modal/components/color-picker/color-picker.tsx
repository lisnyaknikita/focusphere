import { EventForm } from '@/shared/types/event'
import { useState } from 'react'
import classes from './color-picker.module.scss'

interface ColorPickerProps {
	form: EventForm
	setFormField: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void
}

const COLORS = ['#D79716', '#D71616', '#17720F', '#1351AE', '#97107A', '#16ADD7']

export const ColorPicker = ({ form, setFormField }: ColorPickerProps) => {
	const [open, setOpen] = useState(false)

	const selectedColor = form.color

	const handleColorSelect = (color: string) => {
		setFormField('color', color)
		setOpen(false)
	}

	return (
		<div className={classes.colorPicker}>
			<button className={classes.triggerButton} onClick={() => setOpen(prev => !prev)} type='button'>
				<span className={classes.selectedColorCircle} style={{ backgroundColor: selectedColor }}></span>
				<span className={classes.arrow}>
					{open ? (
						<svg width='11' height='7' viewBox='0 0 9 5' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M0.186918 4.79382C0.246674 4.85915 0.317765 4.911 0.396094 4.94639C0.474424 4.98178 0.558439 5 0.643294 5C0.728149 5 0.812165 4.98178 0.890494 4.94639C0.968823 4.911 1.03992 4.85915 1.09967 4.79382L4.04362 1.60136C4.10338 1.53603 4.17447 1.48417 4.2528 1.44878C4.33113 1.41339 4.41515 1.39517 4.5 1.39517C4.58486 1.39517 4.66887 1.41339 4.7472 1.44878C4.82553 1.48417 4.89662 1.53603 4.95638 1.60136L7.90033 4.79382C7.96008 4.85915 8.03118 4.911 8.10951 4.94639C8.18784 4.98178 8.27185 5 8.35671 5C8.44156 5 8.52558 4.98178 8.60391 4.94639C8.68224 4.911 8.75333 4.85915 8.81308 4.79382C8.9328 4.66322 9 4.48655 9 4.3024C9 4.11825 8.9328 3.94159 8.81308 3.81099L5.8627 0.611558C5.50114 0.219958 5.01102 0 4.5 0C3.98899 0 3.49887 0.219958 3.1373 0.611558L0.186918 3.81099C0.0671997 3.94159 0 4.11825 0 4.3024C0 4.48655 0.0671997 4.66322 0.186918 4.79382Z'
								fill='var(--text)'
							/>
						</svg>
					) : (
						<svg width='11' height='7' viewBox='0 0 9 5' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M8.81308 0.206184C8.75333 0.140851 8.68223 0.0889952 8.60391 0.0536073C8.52558 0.0182193 8.44156 0 8.35671 0C8.27185 0 8.18783 0.0182193 8.10951 0.0536073C8.03118 0.0889952 7.96008 0.140851 7.90033 0.206184L4.95638 3.39864C4.89662 3.46397 4.82553 3.51583 4.7472 3.55122C4.66887 3.58661 4.58485 3.60483 4.5 3.60483C4.41514 3.60483 4.33113 3.58661 4.2528 3.55122C4.17447 3.51583 4.10338 3.46397 4.04362 3.39864L1.09967 0.206184C1.03992 0.140851 0.968823 0.0889952 0.890494 0.0536073C0.812164 0.0182193 0.728149 0 0.643294 0C0.558439 0 0.474423 0.0182193 0.396094 0.0536073C0.317765 0.0889952 0.246672 0.140851 0.186917 0.206184C0.0671977 0.336784 0 0.513451 0 0.697599C0 0.881748 0.0671977 1.05841 0.186917 1.18901L3.1373 4.38844C3.49886 4.78004 3.98898 5 4.5 5C5.01101 5 5.50114 4.78004 5.8627 4.38844L8.81308 1.18901C8.9328 1.05841 9 0.881748 9 0.697599C9 0.513451 8.9328 0.336784 8.81308 0.206184Z'
								fill='var(--text)'
							/>
						</svg>
					)}
				</span>
			</button>

			{open && (
				<div className={classes.dropdown}>
					{COLORS.map(color => (
						<button
							type='button'
							key={color}
							className={classes.colorOption}
							style={{ backgroundColor: color }}
							onClick={() => handleColorSelect(color)}
						/>
					))}
				</div>
			)}
		</div>
	)
}
