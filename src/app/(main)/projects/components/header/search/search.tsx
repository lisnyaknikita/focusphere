'use client'

import { useHotkeys } from '@/shared/hooks/use-hotkeys/use-hotkeys'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { SearchIcon } from '@/shared/ui/icons/search-icon'
import clsx from 'clsx'
import { KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'
import classes from './search.module.scss'

interface SearchProps {
	value: string
	onChange: (val: string) => void
}

export const Search = ({ value, onChange }: SearchProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleExpand = useCallback(() => {
		setIsExpanded(true)
		requestAnimationFrame(() => {
			inputRef.current?.focus()
			inputRef.current?.select()
		})
	}, [])

	const handleCollapse = () => {
		if (!value) {
			setIsExpanded(false)
		}
	}

	const searchShortcuts = useMemo(
		() => [
			{
				key: '/',
				callback: (e?: Event) => {
					e?.preventDefault()
					handleExpand()
				},
			},
			{
				key: 'f',
				meta: true,
				callback: (e?: Event) => {
					e?.preventDefault()
					handleExpand()
				},
			},
			{
				key: 'f',
				ctrl: true,
				callback: (e?: Event) => {
					e?.preventDefault()
					handleExpand()
				},
			},
		],
		[handleExpand]
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

	const handleClear = () => {
		onChange('')
		inputRef.current?.focus()
	}

	return (
		<div className={clsx(classes.searchWrapper, (isExpanded || !!value) && classes.expanded)}>
			<ActionTooltip text='Search projects (/ or ⌘F)' isActive={!isExpanded && !value}>
				{(setRef, refProps) => (
					<button
						ref={setRef}
						className={classes.searchIcon}
						onClick={handleExpand}
						aria-label='Search'
						type='button'
						{...refProps}
					>
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
				onFocus={() => setIsExpanded(true)}
				onBlur={handleCollapse}
				onKeyDown={handleKeyDown}
			/>
			{value && (
				<button
					type='button'
					onClick={handleClear}
					className={classes.clearBtn}
					onMouseDown={e => e.preventDefault()}
					aria-label='Clear search'
				>
					✕
				</button>
			)}
		</div>
	)
}
