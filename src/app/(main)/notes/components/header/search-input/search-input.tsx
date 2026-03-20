'use client'

import { useNotesContext } from '@/shared/context/notes-context'
import { SearchIcon } from '@/shared/ui/icons/search-icon'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import classes from './search-input.module.scss'

export const SearchInput = () => {
	const { searchQuery, setSearchQuery } = useNotesContext()
	const [isExpanded, setIsExpanded] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleExpand = () => {
		setIsExpanded(true)
		setTimeout(() => inputRef.current?.focus(), 100)
	}

	const handleCollapse = () => {
		if (!searchQuery) {
			setIsExpanded(false)
		}
	}

	return (
		<div className={clsx(classes.searchWrapper, isExpanded && 'expanded')}>
			<button className={classes.searchIcon} onClick={handleExpand} aria-label='Search'>
				<SearchIcon />
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
