import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { TaskPriority } from '@/shared/types/kanban-task'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import classes from './priority-dropdown.module.scss'

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

interface PriorityDropdownProps {
	value: TaskPriority
	onChange: (priority: TaskPriority) => void
}

export const PriorityDropdown = ({ value, onChange }: PriorityDropdownProps) => {
	const [open, setOpen] = useState(false)
	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const handleSelect = (priority: TaskPriority) => {
		onChange(priority)
		setOpen(false)
	}

	return (
		<div ref={dropdownRef} className={clsx(classes.dropdownContainer, open && 'opened')}>
			<button className={clsx(classes.trigger, classes[value])} onClick={() => setOpen(prev => !prev)} type='button'>
				<span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
				<ArrowBottomIcon />
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						className={classes.dropdown}
						initial={{ opacity: 0, scale: 0.95, y: -6 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.97, y: -4 }}
					>
						{PRIORITIES.map(p => (
							<button
								key={p}
								className={clsx(classes.item, p === value && classes.active)}
								onClick={() => handleSelect(p)}
							>
								{p.charAt(0).toUpperCase() + p.slice(1)}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
