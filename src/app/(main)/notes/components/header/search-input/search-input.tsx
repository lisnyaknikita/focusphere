'use client'

import { useNotesContext } from '@/shared/context/notes-context'
import { useHotkeys } from '@/shared/hooks/use-hotkeys/use-hotkeys'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { SearchIcon } from '@/shared/ui/icons/search-icon'
import clsx from 'clsx'
import { KeyboardEvent, useMemo, useRef, useState } from 'react'
import classes from './search-input.module.scss'

export const SearchInput = () => {
	const { searchQuery, setSearchQuery } = useNotesContext()
	const [isExpanded, setIsExpanded] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleExpand = () => {
		setIsExpanded(true)
		setTimeout(() => {
			inputRef.current?.focus()
			inputRef.current?.select()
		}, 50)
	}

	const handleCollapse = () => {
		if (!searchQuery) {
			setIsExpanded(false)
		}
	}

	const searchShortcuts = useMemo(
		() => [
			{
				key: '/',
				callback: () => handleExpand(),
			},
			{
				key: 'f',
				meta: true,
				callback: () => handleExpand(),
			},
			{
				key: 'f',
				ctrl: true,
				callback: () => handleExpand(),
			},
		],
		[]
	)

	useHotkeys(searchShortcuts)

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			if (searchQuery) {
				setSearchQuery?.('')
			} else {
				inputRef.current?.blur()
			}
		}
	}

	return (
		<div className={clsx(classes.searchWrapper, isExpanded && 'expanded')}>
			<ActionTooltip text='Search notes (/ or ⌘F)' isActive={!isExpanded}>
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
				placeholder='Search notes...'
				value={searchQuery || ''}
				onChange={e => setSearchQuery?.(e.target.value)}
				onBlur={handleCollapse}
				onKeyDown={handleKeyDown}
			/>
			{searchQuery && (
				<button onClick={() => setSearchQuery?.('')} className={classes.clearBtn} onMouseDown={e => e.preventDefault()}>
					✕
				</button>
			)}
		</div>
	)
}
