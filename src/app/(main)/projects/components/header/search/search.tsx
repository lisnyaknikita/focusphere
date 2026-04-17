'use client'

import { SearchIcon } from '@/shared/ui/icons/search-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import classes from './search.module.scss'

interface SearchProps {
	value: string
	onChange: (val: string) => void
}

export const Search = ({ value, onChange }: SearchProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'bottom',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const handleExpand = () => {
		setIsExpanded(true)
		setIsTooltipOpen(false)
		setTimeout(() => inputRef.current?.focus(), 100)
	}

	const handleCollapse = () => {
		if (!value) setIsExpanded(false)
	}

	return (
		<div className={clsx(classes.searchWrapper, isExpanded && 'expanded')}>
			<button
				ref={refs.setReference}
				className={classes.searchIcon}
				onClick={handleExpand}
				aria-label='Search'
				{...getReferenceProps()}
				onMouseEnter={() => !isExpanded && setIsTooltipOpen(true)}
				onMouseLeave={() => setIsTooltipOpen(false)}
			>
				<SearchIcon />
			</button>
			{isTooltipOpen && !isExpanded && (
				<div
					ref={refs.setFloating}
					style={{
						...floatingStyles,
						background: 'var(--save-button-bg)',
						color: 'var(--save-button-text)',
						padding: '4px 8px',
						borderRadius: '5px',
						fontSize: '13px',
						fontWeight: 700,
						zIndex: 1000,
					}}
					{...getFloatingProps()}
				>
					Search projects
				</div>
			)}
			<input
				ref={inputRef}
				type='text'
				className={classes.searchInput}
				placeholder='Search project'
				value={value}
				onChange={e => onChange(e.target.value)}
				onBlur={handleCollapse}
			/>
			{value && (
				<button onClick={() => onChange('')} className={classes.clearBtn} onMouseDown={e => e.preventDefault()}>
					✕
				</button>
			)}
		</div>
	)
}
