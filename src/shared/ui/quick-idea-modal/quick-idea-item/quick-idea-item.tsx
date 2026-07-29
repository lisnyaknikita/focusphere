'use client'

import { QuickIdea } from '@/shared/types/quick-idea'
import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { DeleteIcon } from '../../icons/delete-icon'
import classes from './quick-idea-item.module.scss'

interface QuickIdeaItemProps {
	idea: QuickIdea
	onEdit: (id: string, text: string) => Promise<void>
	onDelete: (id: string) => Promise<void>
}

export const QuickIdeaItem = React.memo(({ idea, onEdit, onDelete }: QuickIdeaItemProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [text, setText] = useState(idea.text)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

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
			handleSave()
		}
		if (e.key === 'Escape') {
			setText(idea.text)
			setIsEditing(false)
		}
	}

	return (
		<div className={classes.item}>
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
			<button type='button' className={classes.deleteBtn} onClick={() => onDelete(idea.$id)} title='Delete'>
				<DeleteIcon />
			</button>
		</div>
	)
})

QuickIdeaItem.displayName = 'QuickIdeaItem'
