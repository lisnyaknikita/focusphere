'use client'

import { useUser } from '@/shared/hooks/use-user/use-user'
import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { useState } from 'react'
import { toast } from 'sonner'
import classes from './feedback-modal.module.scss'

interface FeedbackModalProps {
	isVisible: boolean
	onClose: () => void
}

type FeedbackType = 'bug' | 'suggestion' | 'question'

export const FeedbackModal = ({ isVisible, onClose }: FeedbackModalProps) => {
	const { user } = useUser()
	const [type, setType] = useState<FeedbackType>('bug')
	const [message, setMessage] = useState('')
	const [isSending, setIsSending] = useState(false)

	const handleSend = async () => {
		if (!message.trim()) {
			toast.error('Please enter your message')
			return
		}

		setIsSending(true)

		try {
			const response = await fetch('/api/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type,
					message,
					userEmail: user?.email || 'Anonymous',
					userName: user?.name || 'Guest',
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send feedback')
			}

			toast.success('Thank you! Nikita will receive your message soon.')
			setMessage('')
			onClose()
		} catch (error: unknown) {
			if (error instanceof Error) return error.message
			toast.error('Something went wrong. Please try again.')
		} finally {
			setIsSending(false)
		}
	}

	return (
		<Modal isVisible={isVisible} onClose={onClose}>
			<div className={classes.feedbackModalInner}>
				<div className={classes.header}>
					<h3 className={classes.title}>Feedback & Support</h3>
					<button className={classes.closeX} onClick={onClose}>
						✕
					</button>
				</div>

				<div className={classes.content}>
					<div className={classes.group}>
						<p className={classes.label}>What type of feedback?</p>
						<div className={classes.typeGrid}>
							<button
								className={clsx(classes.typeBtn, type === 'bug' && classes.active)}
								onClick={() => setType('bug')}
							>
								<span className={classes.emoji}>🐛</span>
								<span className={classes.btnLabel}>Bug Report</span>
							</button>

							<button
								className={clsx(classes.typeBtn, type === 'suggestion' && classes.active)}
								onClick={() => setType('suggestion')}
							>
								<span className={classes.emoji}>💡</span>
								<span className={classes.btnLabel}>Suggestion</span>
							</button>

							<button
								className={clsx(classes.typeBtn, type === 'question' && classes.active)}
								onClick={() => setType('question')}
							>
								<span className={classes.emoji}>❓</span>
								<span className={classes.btnLabel}>Question</span>
							</button>
						</div>
					</div>

					<div className={classes.group}>
						<p className={classes.label}>Message</p>
						<textarea
							className={classes.textarea}
							placeholder='Describe your feedback in detail...'
							value={message}
							onChange={e => setMessage(e.target.value)}
							rows={5}
						/>
					</div>
				</div>

				<div className={classes.footer}>
					<button className={classes.cancelBtn} onClick={onClose} disabled={isSending}>
						Cancel
					</button>
					<button
						type='button'
						className={classes.sendBtn}
						onClick={handleSend}
						disabled={!message.trim() || isSending}
					>
						{isSending ? 'Sending message...' : 'Send Feedback'}
					</button>
				</div>
			</div>
		</Modal>
	)
}
