'use client'

import { createCustomTemplate } from '@/lib/diary/templates'
import { useThemeToggle } from '@/shared/hooks/use-theme-toggle/use-theme-toggle'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { CustomJournalTemplate } from '@/shared/types/journal'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import classes from './create-template-modal.module.scss'

interface CreateTemplateModalProps {
	onClose: () => void
	onTemplateCreated: (template: CustomJournalTemplate) => void
}

export const CreateTemplateModal = ({ onClose, onTemplateCreated }: CreateTemplateModalProps) => {
	const { user } = useUser()
	const { isDark } = useThemeToggle()
	const [title, setTitle] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	const editor = useCreateBlockNote()

	useEffect(() => {
		const el = editor?.portalElement
		if (!el) return
		el.style.setProperty('--bn-ui-base-z-index', '2000')
		return () => {
			el.style.removeProperty('--bn-ui-base-z-index')
		}
	}, [editor])

	const handleSave = async () => {
		if (!title.trim()) {
			toast.error('Please enter a template title')
			return
		}
		if (!user?.$id) return

		setIsSaving(true)
		try {
			const jsonContent = JSON.stringify(editor.document)

			const payload = {
				title: title.trim(),
				content: jsonContent,
				userId: user.$id,
			}

			const newTemplate = await createCustomTemplate(payload)

			onTemplateCreated(newTemplate)
			toast.success('Template created successfully!')
			onClose()
		} catch (error) {
			console.error('Failed to save template:', error)
			toast.error('Failed to save template')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className={classes.modalInner}>
			<header className={classes.modalHeader}>
				<h3>Create Custom Template</h3>
				<button type='button' className={classes.closeX} onClick={onClose}>
					✕
				</button>
			</header>
			<div className={classes.content}>
				<input
					type='text'
					className={classes.templateTitleInput}
					placeholder='Template Name (e.g., Weekly Retrospective)...'
					value={title}
					onChange={e => setTitle(e.target.value)}
					maxLength={35}
				/>
				<div className={classes.editorWrapper}>
					<BlockNoteView editor={editor} theme={isDark ? 'dark' : 'light'} sideMenu={true} formattingToolbar={true} />
				</div>
			</div>
			<footer className={classes.modalFooter}>
				<button type='button' className={classes.saveBtn} onClick={handleSave} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Template'}
				</button>
				<button type='button' className={classes.cancelBtn} onClick={onClose}>
					Cancel
				</button>
			</footer>
		</div>
	)
}
