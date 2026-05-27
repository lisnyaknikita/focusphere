'use client'

import { TaskPriority } from '@/shared/types/kanban-task'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import {
	autoUpdate,
	flip,
	FloatingPortal,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from '@floating-ui/react'
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
	const [isOpen, setIsOpen] = useState(false)

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-start',
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip(), shift()],
	})

	const click = useClick(context)
	const dismiss = useDismiss(context)
	const role = useRole(context, { role: 'listbox' })

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

	const handleSelect = (priority: TaskPriority) => {
		onChange(priority)
		setIsOpen(false)
	}

	return (
		<div className={classes.dropdownContainer}>
			<button
				ref={refs.setReference}
				className={clsx(classes.trigger, classes[value])}
				{...getReferenceProps()}
				type='button'
			>
				<span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
				<ArrowBottomIcon className={clsx(classes.arrowIcon, isOpen && classes.open)} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<FloatingPortal>
						<div
							ref={refs.setFloating}
							style={{ ...floatingStyles, zIndex: 2100 }}
							{...getFloatingProps()}
						>
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
										type='button'
									>
										{p.charAt(0).toUpperCase() + p.slice(1)}
									</button>
								))}
							</motion.div>
						</div>
					</FloatingPortal>
				)}
			</AnimatePresence>
		</div>
	)
}

