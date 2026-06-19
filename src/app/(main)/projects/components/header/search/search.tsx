'use client'

import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
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
		inputRef.current?.focus()
	}

	const handleCollapse = () => {
		if (!value) setIsExpanded(false)
	}

	return (
		<div className={clsx(classes.searchWrapper, isExpanded && 'expanded')}>
			<ActionTooltip text='Search projects' isActive={!isExpanded}>
				{(setRef, refProps) => (
					<button ref={setRef} className={classes.searchIcon} onClick={handleExpand} aria-label='Search' {...refProps}>
						<SearchIcon />
					</button>
				)}
			</ActionTooltip>
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
