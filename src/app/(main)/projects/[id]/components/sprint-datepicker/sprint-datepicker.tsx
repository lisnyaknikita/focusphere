'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import classes from './sprint-datepicker.module.scss'

interface SprintDatePickerProps {
	value: string
	onChange: (val: string) => void
	placeholder?: string
}

export const SprintDatePicker = ({ value, onChange, placeholder = 'Select date' }: SprintDatePickerProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const dateObj = value ? new Date(value) : new Date()

	const formattedDisplay = (() => {
		try {
			return value ? format(new Date(value), 'MMM d, yyyy') : placeholder
		} catch {
			return placeholder
		}
	})()

	return (
		<div className={classes.container}>
			<button type='button' className={classes.dateButton} onClick={() => setIsOpen(true)}>
				<span>{formattedDisplay}</span>
				<span className={classes.calendarIcon}>📅</span>
			</button>

			{isOpen && (
				<Modal isVisible={isOpen} onClose={() => setIsOpen(false)} style={{ padding: 0 }}>
					<div className={classes.pickerWrapper}>
						<DayPicker
							mode='single'
							selected={dateObj}
							onSelect={date => {
								if (date) {
									onChange(format(date, 'yyyy-MM-dd'))
									setIsOpen(false)
								}
							}}
						/>
					</div>
				</Modal>
			)}
		</div>
	)
}
