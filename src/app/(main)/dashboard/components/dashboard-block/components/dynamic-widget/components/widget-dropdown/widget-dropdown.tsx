'use client'

import { DashboardWidgetType } from '@/shared/types/dashboard-widget'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import classes from './widget-dropdown.module.scss'

interface WidgetOption {
	value: DashboardWidgetType
	label: string
}

const WIDGET_OPTIONS: WidgetOption[] = [
	{ value: 'quotes', label: 'Quotes' },
	{ value: 'timeblocks', label: 'Timeblocks' },
	{ value: 'pomodoro', label: 'Pomodoro' },
]

interface WidgetDropdownProps {
	value: DashboardWidgetType
	onChange: (value: DashboardWidgetType) => void
}

export const WidgetDropdown = ({ value, onChange }: WidgetDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const currentLabel = WIDGET_OPTIONS.find(opt => opt.value === value)?.label || 'Quotes'

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleSelect = (optionValue: DashboardWidgetType) => {
		onChange(optionValue)
		setIsOpen(false)
	}

	return (
		<div className={classes.dropdownWrapper} ref={dropdownRef}>
			<button
				type='button'
				className={clsx(classes.triggerButton, isOpen && classes.active)}
				onClick={() => setIsOpen(prev => !prev)}
				aria-label='Select widget view'
			>
				<span>{currentLabel}</span>
				<motion.svg
					width='12'
					height='12'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.2 }}
				>
					<path d='M6 9l6 6 6-6' />
				</motion.svg>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						className={classes.dropdownMenu}
						initial={{ opacity: 0, y: -8, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.95 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						{WIDGET_OPTIONS.map(option => (
							<button
								key={option.value}
								type='button'
								className={clsx(classes.menuItem, option.value === value && classes.selected)}
								onClick={() => handleSelect(option.value)}
							>
								{option.label}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
