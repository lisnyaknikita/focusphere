'use client'

import { getDurationString, TIME_OPTIONS } from '@/shared/utils/time/time'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import classes from './time-dropdown.module.scss'

interface TimeDropdownProps {
	value: string
	onChange: (value: string) => void
	compareTime?: string
}

export const TimeDropdown = ({ value, onChange, compareTime }: TimeDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [focusedIndex, setFocusedIndex] = useState(-1)

	const containerRef = useRef<HTMLDivElement>(null)

	const options = compareTime ? TIME_OPTIONS.filter(time => time > compareTime) : TIME_OPTIONS

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		if (isOpen) {
			const currentIndex = TIME_OPTIONS.indexOf(value)
			setFocusedIndex(currentIndex >= 0 ? currentIndex : 0)
		} else {
			setFocusedIndex(-1)
		}
	}, [isOpen, value])

	useEffect(() => {
		if (isOpen && focusedIndex >= 0 && containerRef.current) {
			const focusedItem = containerRef.current.querySelector(`[data-index="${focusedIndex}"]`)
			focusedItem?.scrollIntoView({ block: 'nearest' })
		}
	}, [focusedIndex, isOpen])

	const handleSelect = (e: React.MouseEvent | React.KeyboardEvent, time: string) => {
		e.stopPropagation()
		onChange(time)
		setIsOpen(false)
		containerRef.current?.querySelector('button')?.focus()
	}

	const handleToggle = () => {
		setIsOpen(prev => !prev)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!isOpen) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault()
				setIsOpen(true)
			}
			return
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				setFocusedIndex(prev => (prev < TIME_OPTIONS.length - 1 ? prev + 1 : 0))
				break
			case 'ArrowUp':
				e.preventDefault()
				setFocusedIndex(prev => (prev > 0 ? prev - 1 : TIME_OPTIONS.length - 1))
				break
			case 'Enter':
			case ' ':
				e.preventDefault()
				if (focusedIndex >= 0 && focusedIndex < TIME_OPTIONS.length) {
					handleSelect(e, TIME_OPTIONS[focusedIndex])
				}
				break
			case 'Escape':
				e.preventDefault()
				setIsOpen(false)
				containerRef.current?.querySelector('button')?.focus()
				break
			case 'Tab':
				setIsOpen(false)
				break
		}
	}

	return (
		<div className={classes.dropdownContainer} ref={containerRef} onKeyDown={handleKeyDown}>
			<button
				type='button'
				className={`${classes.dropdownTrigger} ${isOpen ? classes.active : ''}`}
				onClick={handleToggle}
				aria-haspopup='listbox'
				aria-expanded={isOpen}
			>
				{value}
			</button>

			{isOpen && (
				<div className={classes.dropdownList} role='listbox' onMouseDown={e => e.stopPropagation()}>
					{options.map((time, index) => {
						const isSelected = time === value
						const isFocused = index === focusedIndex
						const duration = compareTime ? getDurationString(compareTime, time) : null

						return (
							<button
								key={time}
								type='button'
								tabIndex={-1}
								data-index={index}
								className={clsx(classes.dropdownItem, isSelected && classes.selected, isFocused && classes.focused)}
								onClick={e => handleSelect(e, time)}
								role='option'
								aria-selected={isSelected}
							>
								<span className={classes.timeText}>{time}</span>
								{duration && <span className={classes.durationText}>{duration}</span>}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
