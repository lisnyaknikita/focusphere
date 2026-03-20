'use client'

import { SendIcon } from '@/shared/ui/icons/send-icon'
import Quill, { QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'
import classes from './editor.module.scss'

interface EditorProps {
	onSend: (content: string) => void
	disabled?: boolean
}

export const Editor = ({ onSend, disabled }: EditorProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const quillRef = useRef<Quill | null>(null)

	const onSendRef = useRef(onSend)
	onSendRef.current = onSend

	const handleSend = () => {
		if (!quillRef.current) return

		const content = quillRef.current.root.innerHTML.trim()

		if (content === '<p><br></p>' || content === '' || quillRef.current.getText().trim() === '') return

		onSendRef.current(content)

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
					<button className={classes.sendButton} onClick={handleSend} disabled={disabled}>
						<SendIcon />
					</button>
				</div>
			</div>
		</div>
	)
}
