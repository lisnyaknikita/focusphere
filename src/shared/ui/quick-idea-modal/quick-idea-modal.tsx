'use client'

import { ChangeEvent, FormEvent, KeyboardEvent, useState } from 'react'
import classes from './quick-idea-modal.module.scss'

interface QuickIdeaModalProps {
	onSave: (content: string) => Promise<void>
	onClose: () => void
}

export const QuickIdeaModal = ({ onSave, onClose }: QuickIdeaModalProps) => {
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e?: FormEvent | KeyboardEvent) => {
		e?.preventDefault()

		if (!content.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			await onSave(content.trim())
			onClose()
		} catch (error) {
			console.error('Failed to quick-save note:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSubmit()
		}
	}

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value)
	}

	return (
		<div className={classes.modalInner}>
			<div className={classes.modal}>
				<h3 className={classes.title}>Quick Capture</h3>
				<textarea
					placeholder='What is on your mind? (Enter to save)'
					className={classes.notesContent}
					value={content}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					autoFocus
					disabled={isSubmitting}
					rows={4}
				/>
				<div className={classes.buttons}>
					<button type='button' className={classes.cancelButton} onClick={onClose}>
						Cancel
					</button>
					<button
						type='button'
						className={classes.confirmButton}
						onClick={() => handleSubmit()}
						disabled={isSubmitting || !content.trim()}
					>
						{isSubmitting ? 'Saving...' : 'Save Idea'}
					</button>
				</div>
			</div>
		</div>
	)
}
