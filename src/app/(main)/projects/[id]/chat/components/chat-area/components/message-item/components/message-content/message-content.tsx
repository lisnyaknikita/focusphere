'use client'

import { ChatMessage } from '@/shared/types/chat'
import { KanbanTask } from '@/shared/types/kanban-task'
import { ImagePreviewModal } from '@/shared/ui/image-preview-modal/image-preview-modal'
import { renderParsedContent } from '@/shared/utils/parse-message-content/parse-message-content'
import { stripHtml } from '@/shared/utils/strip-html/strip-html'
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Editor } from '../../../editor/editor'
import classes from './message-content.module.scss'

interface MessageContentProps {
	isContinuation: boolean
	isEdited: boolean | undefined
	isEditing: boolean
	editValue: string
	message: ChatMessage
	displayName: string
	onUpdate: (id: string, content: string) => void
	setEditValue: Dispatch<SetStateAction<string>>
	setIsEditing: Dispatch<SetStateAction<boolean>>
	repliedToMessage?: ChatMessage
	tasks?: KanbanTask[]
}

export const MessageContent = ({
	isContinuation,
	isEdited,
	isEditing,
	message,
	displayName,
	onUpdate,
	setIsEditing,
	repliedToMessage,
	tasks = [],
}: MessageContentProps) => {
	const [isMounted, setIsMounted] = useState(false)
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const formattedTime = useMemo(() => {
		if (isContinuation) return ''
		return new Date(message.$createdAt).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		})
	}, [message.$createdAt, isContinuation])

	const repliedImageSrc = useMemo(() => {
		if (!repliedToMessage?.content) return null
		const match = repliedToMessage.content.match(/<img[^>]+src=["']([^"']+)["']/i)
		return match ? match[1] : null
	}, [repliedToMessage?.content])

	const repliedText = useMemo(() => {
		if (!repliedToMessage) return ''
		const cleanText = stripHtml(repliedToMessage.content).trim()
		if (!cleanText && repliedImageSrc) return 'Photo'
		return cleanText
	}, [repliedToMessage, repliedImageSrc])

	const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement
		if (target.tagName === 'IMG') {
			const imgSrc = target.getAttribute('src')
			if (imgSrc) {
				setPreviewImageUrl(imgSrc)
			}
		}
	}

	return (
		<>
			<div className={classes.messageContent}>
				{!isContinuation && (
					<div className={classes.messageHeader}>
						<div className={classes.name}>{displayName}</div>
						<time>{formattedTime}</time>
						{isEdited && <span className={classes.editedMessage}>(edited)</span>}
					</div>
				)}
				{repliedToMessage && (
					<div className={classes.replyQuote}>
						<div className={classes.replyQuoteInner}>
							<div className={classes.replyQuoteName}>{repliedToMessage.senderName}</div>
							<div className={classes.replyQuoteText}>{repliedText}</div>
						</div>
						{repliedImageSrc && (
							<img src={repliedImageSrc} alt='Reply attachment preview' className={classes.replyImageThumbnail} />
						)}
					</div>
				)}

				<div className={classes.messageText} onClick={handleContentClick}>
					{isEditing ? (
						<Editor
							initialContent={message.content}
							onSend={newContent => {
								onUpdate(message.$id, newContent)
								setIsEditing(false)
							}}
							tasks={tasks}
						/>
					) : !isMounted || !tasks || tasks.length === 0 ? (
						<div dangerouslySetInnerHTML={{ __html: message.content }} />
					) : (
						<div>{renderParsedContent(message.content, tasks)}</div>
					)}
				</div>
			</div>

			<ImagePreviewModal src={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
		</>
	)
}
