'use client'

import { useHotkeys } from '@/shared/hooks/use-hotkeys/use-hotkeys'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { SearchIcon } from '@/shared/ui/icons/search-icon'
import clsx from 'clsx'
import { KeyboardEvent, useMemo, useRef, useState } from 'react'
import classes from './search.module.scss'

interface SearchProps {
	value: string
	onChange: (val: string) => void
}

export const Search = ({ value, onChange }: SearchProps) => {
	const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
	const [isExpanded, setIsExpanded] = useState(isMobile)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleExpand = () => {
		setIsExpanded(true)
		setTimeout(() => {
			inputRef.current?.focus()
			inputRef.current?.select()
		}, 50)
	}

	const handleCollapse = () => {
		if (!value && !isMobile) setIsExpanded(false)
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
			if (value) {
				onChange('')
			} else {
				inputRef.current?.blur()
			}
		}
	}

	return (
		<div className={clsx(classes.searchWrapper, isExpanded && 'expanded')}>
			<ActionTooltip text='Search projects (/ or ⌘F)' isActive={!isExpanded}>
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
				placeholder='Search project...'
				value={value}
				onChange={e => onChange(e.target.value)}
				onBlur={handleCollapse}
				onKeyDown={handleKeyDown}
			/>
			{value && (
				<button onClick={() => onChange('')} className={classes.clearBtn} onMouseDown={e => e.preventDefault()}>
					✕
				</button>
			)}
		</div>
	)
}
