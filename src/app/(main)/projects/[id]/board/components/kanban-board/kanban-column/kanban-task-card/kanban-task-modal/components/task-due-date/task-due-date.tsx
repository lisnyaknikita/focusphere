'use client'

import { Modal } from '@/shared/ui/modal/modal'
import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import classes from './task-due-date.module.scss'

interface TaskDueDateProps {
	value?: string | null
	onChange: (value: string | null) => void
}

export const TaskDueDate = ({ value, onChange }: TaskDueDateProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const selectedDate = value ? new Date(value) : undefined

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(null)
	}

	return (
		<div className={classes.container}>
			<button
				type='button'
				className={`${classes.dateButton} ${!value ? classes.placeholder : ''}`}
				onClick={() => setIsOpen(true)}
			>
				{value ? format(new Date(value), 'MMM d') : 'Add due date'}
			</button>

			{value && (
				<button type='button' className={classes.clearButton} onClick={handleClear} title='Remove due date'>
					&times;
				</button>
			)}

			{isOpen && (
				<Modal isVisible={isOpen} onClose={() => setIsOpen(false)}>
					<div className={classes.pickerWrapper}>
						<DayPicker
							mode='single'
							selected={selectedDate}
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
