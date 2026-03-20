import { JOURNAL_TEMPLATES, TemplateKey } from '@/shared/constants/journal-templates'
import { useNotesContext } from '@/shared/context/notes-context'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import classes from './templates-dropdown.module.scss'

export const TemplatesDropdown = () => {
	const [open, setOpen] = useState(false)
	const { createNote } = useNotesContext()

	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const handleSelect = async (key: TemplateKey) => {
		await createNote(key)
		setOpen(false)
	}

	return (
		<div ref={dropdownRef} className={clsx(classes.templates, open && 'opened')}>
			<button className={classes.trigger} onClick={() => setOpen(prev => !prev)}>
				<span>Templates</span>
				<ArrowBottomIcon />
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						className={classes.dropdown}
						initial={{ opacity: 0, scale: 0.95, y: -6 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.97, y: -4 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}
					>
						{Object.values(JOURNAL_TEMPLATES).map(template => (
							<button
								className={classes.templateItem}
								key={template.key}
								onClick={() => handleSelect(template.key as TemplateKey)}
							>
								<span className={classes.icon}>{template.icon}</span>
								{template.title}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
