'use client'

import { JOURNAL_TEMPLATES, TemplateKey } from '@/shared/constants/journal-templates'
import { useNotesContext } from '@/shared/context/notes-context'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateTemplateModal } from '../create-template-modal/create-template-modal'
import classes from './templates-dropdown.module.scss'

export const TemplatesDropdown = () => {
	const [open, setOpen] = useState(false)
	const [isConstructorOpen, setIsConstructorOpen] = useState(false)

	const { createNote, customTemplates, addCustomTemplateState, deleteCustomTemplate } = useNotesContext()

	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const handleSelectSystem = async (key: TemplateKey) => {
		await createNote(key)
		setOpen(false)
	}

	const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
		e.stopPropagation()
		if (!deleteCustomTemplate) return

		toast.promise(deleteCustomTemplate(templateId), {
			loading: 'Deleting template...',
			success: 'Template deleted successfully',
			error: 'Failed to delete template',
		})
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
						<div className={classes.sectionLabel}>System Templates</div>
						{Object.values(JOURNAL_TEMPLATES).map(template => (
							<button
								type='button'
								className={classes.templateItem}
								key={template.key}
								onClick={() => handleSelectSystem(template.key as TemplateKey)}
							>
								<span className={classes.icon}>{template.icon}</span>
								{template.title}
							</button>
						))}

						{customTemplates && customTemplates.length > 0 && (
							<>
								<hr className={classes.divider} />
								<div className={classes.sectionLabel}>Custom Templates</div>

								<div className={classes.customTemplatesList}>
									{customTemplates.map(template => (
										<div key={template.$id} className={classes.customTemplateRow}>
											<button
												type='button'
												className={classes.templateItem}
												onClick={() => {
													createNote(template)
													setOpen(false)
												}}
											>
												<span className={classes.icon}>📝</span>
												<span className={classes.templateTitleText}>{template.title}</span>
											</button>

											<button
												type='button'
												className={classes.deleteTemplateBtn}
												onClick={e => handleDeleteTemplate(e, template.$id)}
												title='Delete template'
											>
												<DeleteIcon />
											</button>
										</div>
									))}
								</div>
							</>
						)}
						<button
							type='button'
							className={classes.createTemplateAction}
							onClick={() => {
								setIsConstructorOpen(true)
								setOpen(false)
							}}
						>
							Create Custom
						</button>
					</motion.div>
				)}
			</AnimatePresence>
			<Modal
				isVisible={isConstructorOpen}
				onClose={() => setIsConstructorOpen(false)}
				className={classes.modalOverride}
			>
				<CreateTemplateModal onClose={() => setIsConstructorOpen(false)} onTemplateCreated={addCustomTemplateState!} />
			</Modal>
		</div>
	)
}
