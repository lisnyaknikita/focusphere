'use client'

import { useNotesContext } from '@/shared/context/notes-context'
import { SearchIcon } from '@/shared/ui/icons/search-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import classes from './search-input.module.scss'

export const SearchInput = () => {
	const { searchQuery, setSearchQuery } = useNotesContext()
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
		if (!searchQuery) {
			setIsExpanded(false)
		}
	}

	return (
		<div className={clsx(classes.searchWrapper, isExpanded && 'expanded')}>
			<button
				ref={refs.setReference}
				className={classes.searchIcon}
				onClick={handleExpand}
				{...getReferenceProps()}
				onMouseEnter={() => !isExpanded && setIsTooltipOpen(true)}
				onMouseLeave={() => setIsTooltipOpen(false)}
				aria-label='Search'
			>
				<SearchIcon />
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
							whiteSpace: 'nowrap',
						}}
						{...getFloatingProps()}
					>
						Search notes
					</div>
				)}
			</button>
			<input
				ref={inputRef}
				type='text'
				className={classes.searchInput}
				placeholder='Search notes...'
				value={searchQuery || ''}
				onChange={e => setSearchQuery?.(e.target.value)}
				onBlur={handleCollapse}
			/>
			{searchQuery && (
				<button onClick={() => setSearchQuery?.('')} className={classes.clearBtn} onMouseDown={e => e.preventDefault()}>
					✕
				</button>
			)}
		</div>
	)
}
