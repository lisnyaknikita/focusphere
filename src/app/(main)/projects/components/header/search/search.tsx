'use client'

import { SearchIcon } from '@/shared/ui/icons/search-icon'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import classes from './search.module.scss'

interface SearchProps {
	value: string
	onChange: (val: string) => void
}

export const Search = ({ value, onChange }: SearchProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleExpand = () => {
		setIsExpanded(true)
		setTimeout(() => inputRef.current?.focus(), 100)
	}

	const handleCollapse = () => {
		if (!value) setIsExpanded(false)
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
