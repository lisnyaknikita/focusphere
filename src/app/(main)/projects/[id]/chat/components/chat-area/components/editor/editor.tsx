'use client'

import { SendIcon } from '@/shared/ui/icons/send-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import Quill, { QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef, useState } from 'react'
import classes from './editor.module.scss'

interface EditorProps {
	onSend: (content: string) => void
	disabled?: boolean
}

export const Editor = ({ onSend, disabled }: EditorProps) => {
	const [isTooltipOpen, setIsTooltipOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const quillRef = useRef<Quill | null>(null)

	const onSendRef = useRef(onSend)
	onSendRef.current = onSend

	const { refs, floatingStyles, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context)
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const handleSend = () => {
		if (!quillRef.current) return

		const content = quillRef.current.root.innerHTML.trim()

		if (content === '<p><br></p>' || content === '' || quillRef.current.getText().trim() === '') return

		onSendRef.current(content)
		setIsTooltipOpen(false)

		quillRef.current.setContents([])
		quillRef.current.focus()
	}

	useEffect(() => {
		if (!containerRef.current) return

		containerRef.current.innerHTML = ''
		const editorContainer = document.createElement('div')
		containerRef.current.appendChild(editorContainer)

		const options: QuillOptions = {
			placeholder: 'Write a message...',
			theme: 'snow',
			modules: {
				toolbar: [
					['bold', 'italic', 'strike'],
					['link', 'code-block'],
					[{ list: 'ordered' }, { list: 'bullet' }],
				],
				keyboard: {
					bindings: {
						enter: {
							key: 'Enter',
							shiftKey: false,
							handler: () => {
								handleSend()
								return false
							},
						},
					},
				},
			},
		}

		const quill = new Quill(editorContainer, options)
		quillRef.current = quill

		setTimeout(() => {
			quill.focus()
		}, 100)

		return () => {
			quillRef.current = null
			if (containerRef.current) containerRef.current.innerHTML = ''
		}
	}, [])

	return (
		<div className={classes.editor}>
			<div className={classes.editorInner}>
				<div ref={containerRef} className='ql-chat-custom' />
				<div className={classes.additionalButtons}>
					<button
						ref={refs.setReference}
						className={classes.sendButton}
						onClick={handleSend}
						disabled={disabled}
						{...getReferenceProps()}
					>
						<SendIcon />
						{isTooltipOpen && (
							<div
								ref={refs.setFloating}
								style={{
									...floatingStyles,
									background: 'var(--save-button-bg)',
									color: 'var(--save-button-text)',
									padding: '4px 8px',
									borderRadius: '5px',
									fontSize: '13px',
									fontWeight: 700,
									zIndex: 1000,
									whiteSpace: 'nowrap',
								}}
								{...getFloatingProps()}
							>
								Send message (Enter)
							</div>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
