'use client'

import { useQuickIdeas } from '@/shared/hooks/use-quick-ideas/use-quick-ideas'
import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { toast } from 'sonner'
import classes from './quick-idea-modal.module.scss'

interface QuickIdeaModalProps {
	onClose: () => void
}

export const QuickIdeaModal = ({ onClose }: QuickIdeaModalProps) => {
	const [content, setContent] = useState('')
	const { handleAddIdea, isSaving } = useQuickIdeas()

	const handleSubmit = async () => {
		const trimmed = content.trim()
		if (!trimmed || isSaving) return

		try {
			await handleAddIdea(trimmed)
			toast.success('Idea captured!')
			onClose()
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to save idea.')
			}
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSubmit()
		}
		if (e.key === 'Escape') {
			e.preventDefault()
			onClose()
		}
	}

	return (
		<div className={classes.modal}>
			<h3 className={classes.title}>Quick Capture</h3>
			<textarea
				placeholder='What is on your mind? (Press Enter to save)'
				className={classes.textarea}
				value={content}
				onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				autoFocus
				disabled={isSaving}
				rows={4}
			/>
			<div className={classes.buttons}>
				<button type='button' className={classes.cancelButton} onClick={onClose}>
					Cancel
				</button>
				<button
					type='button'
					className={classes.confirmButton}
					onClick={handleSubmit}
					disabled={isSaving || !content.trim()}
				>
					{isSaving ? 'Saving...' : 'Save Idea'}
				</button>
			</div>
		</div>
	)
}
