'use client'

import { createGeneralNote } from '@/lib/notes/notes'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { QuickIdea } from '@/shared/types/quick-idea'
import { ArrowBottomIcon } from '@/shared/ui/icons/arrow-bottom-icon'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ConvertIdeaToTaskModal } from '../../convert-idea-task-modal/convert-idea-task-modal'
import { DeleteIcon } from '../../icons/delete-icon'
import classes from './quick-idea-item.module.scss'

interface QuickIdeaItemProps {
	idea: QuickIdea
	onEdit: (id: string, text: string) => Promise<void>
	onDelete: (id: string) => Promise<void>
	onCloseDrawer?: () => void
}

export const QuickIdeaItem = React.memo(({ idea, onEdit, onDelete, onCloseDrawer }: QuickIdeaItemProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [isExpanded, setIsExpanded] = useState(false)
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
	const [isConvertingNote, setIsConvertingNote] = useState(false)
	const [text, setText] = useState(idea.text)
	const { user } = useUser()
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		setText(idea.text)
	}, [idea.text])

	const adjustHeight = (el: HTMLTextAreaElement) => {
		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight + 2}px`
	}

	useEffect(() => {
		if (isEditing && textareaRef.current) {
			const el = textareaRef.current
			adjustHeight(el)
			el.focus()
			const length = el.value.length
			el.setSelectionRange(length, length)
		}
	}, [isEditing])

	const handleSave = () => {
		const trimmed = text.trim()
		if (trimmed && trimmed !== idea.text) {
			onEdit(idea.$id, trimmed)
		} else {
			setText(idea.text)
		}
		setIsEditing(false)
	}

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value)

		if (textareaRef.current) {
			adjustHeight(textareaRef.current)
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			e.currentTarget.blur()
		}
		if (e.key === 'Escape') {
			setText(idea.text)
			setIsEditing(false)
		}
	}

	const handleConvertToEvent = () => {
		onCloseDrawer?.()
		const encodedTitle = encodeURIComponent(idea.text)
		router.push(`${pathname}?modal=create-event&title=${encodedTitle}&fromIdeaId=${idea.$id}`)
	}

	const handleConvertToNote = async () => {
		if (isConvertingNote || !user) return
		setIsConvertingNote(true)
		try {
			const newNote = await createGeneralNote({
				title: idea.text,
				content: '',
				userId: user.$id,
			})
			await onDelete(idea.$id)
			toast.success('Converted to Note!')
			onCloseDrawer?.()
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('refresh-general-notes', { detail: { newNote } }))
			}
			router.push(`/notes?activeNoteId=${newNote.$id}`)
		} catch (err) {
			console.error(err)
			toast.error('Failed to create note')
		} finally {
			setIsConvertingNote(false)
		}
	}

	return (
		<>
			<div className={clsx(classes.itemContainer, isExpanded && classes.expanded)}>
				<div className={classes.itemHeader}>
					{isEditing ? (
						<textarea
							ref={textareaRef}
							rows={1}
							className={classes.inlineInput}
							value={text}
							onChange={handleChange}
							onBlur={handleSave}
							onKeyDown={handleKeyDown}
						/>
					) : (
						<span className={classes.itemText} onClick={() => setIsEditing(true)}>
							{idea.text}
						</span>
					)}

					<div className={classes.buttonGroup}>
						<button
							type='button'
							className={clsx(classes.expandBtn, isExpanded && classes.expandBtnActive)}
							onClick={() => setIsExpanded(prev => !prev)}
							title='Actions'
						>
							<ArrowBottomIcon />
						</button>

						<button type='button' className={classes.deleteBtn} onClick={() => onDelete(idea.$id)} title='Delete'>
							<DeleteIcon />
						</button>
					</div>
				</div>

				<AnimatePresence>
					{isExpanded && (
						<motion.div
							className={classes.actionSection}
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
						>
							<div className={classes.actionInner}>
								<div className={classes.actionButtons}>
									<button type='button' className={classes.actionBtn} onClick={() => setIsTaskModalOpen(true)}>
										📋 Task
									</button>
									<button type='button' className={classes.actionBtn} onClick={handleConvertToEvent}>
										📅 Event
									</button>
									<button
										type='button'
										className={classes.actionBtn}
										onClick={handleConvertToNote}
										disabled={isConvertingNote}
									>
										📝 Note
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{isTaskModalOpen && (
				<ConvertIdeaToTaskModal
					isOpen={isTaskModalOpen}
					ideaText={idea.text}
					ideaId={idea.$id}
					onClose={() => setIsTaskModalOpen(false)}
					onSuccess={async id => {
						await onDelete(id)
						onCloseDrawer?.()
					}}
				/>
			)}
		</>
	)
})

QuickIdeaItem.displayName = 'QuickIdeaItem'
