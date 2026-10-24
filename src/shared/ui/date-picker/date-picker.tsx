'use client'

import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import classes from './date-picker.module.scss'

interface DatePickerProps {
	value?: string
	onChange: (dateStr: string) => void
	placeholder?: string
	disabled?: boolean
	formatString?: string
	className?: string
	buttonClassName?: string
	onOpen?: () => void
}

const parseDateString = (dateStr?: string): Date => {
	if (!dateStr) return new Date()
	try {
		const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number)
		if (isNaN(y) || isNaN(m) || isNaN(d)) return new Date()
		return new Date(y, m - 1, d)
	} catch {
		return new Date()
	}
}

export const DatePicker = ({
	value,
	onChange,
	placeholder = 'Pick a date',
	disabled = false,
	formatString = 'MMM d, yyyy',
	className,
	buttonClassName,
	onOpen,
}: DatePickerProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const selectedDate = value ? parseDateString(value) : undefined

	const handleOpen = () => {
		if (disabled) return
		onOpen?.()
		setIsOpen(true)
	}

	const displayDate = (() => {
		if (!value) return placeholder
		try {
			return format(parseDateString(value), formatString)
		} catch {
			return placeholder
		}
	})()

	return (
		<div className={clsx(classes.datePickerContainer, className)}>
			<button
				type='button'
				className={clsx(classes.dateButton, buttonClassName, disabled && classes.disabled)}
				onClick={handleOpen}
				disabled={disabled}
			>
				<span>{displayDate}</span>
			</button>

			{isOpen && (
				<Modal isVisible={isOpen} onClose={() => setIsOpen(false)}>
					<div className={classes.pickerWrapper}>
						<DayPicker
							mode='single'
							selected={selectedDate}
							defaultMonth={selectedDate || new Date()}
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
