'use client'

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
			},
		}

		const quill = new Quill(editorContainer, options)
		quillRef.current = quill

		quill.keyboard.addBinding({
			key: 'Enter',
			shiftKey: false,
			handler: function () {
				handleSend()
			},
		})

		return () => {
			quillRef.current = null
			if (containerRef.current) containerRef.current.innerHTML = ''
		}
	}, [])

	const handleSend = () => {
		if (!quillRef.current) return

		const content = quillRef.current.root.innerHTML.trim()

		if (content === '<p><br></p>' || content === '') return

		onSend(content)

		quillRef.current.setContents([])
		quillRef.current.focus()
	}

	return (
		<div className={classes.editorWrapper}>
			<div className={classes.editorContainer}>
				<div ref={containerRef} className='ql-chat-custom' />
				<button className={classes.sendButton} onClick={handleSend} disabled={disabled}>
					<svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
						<path d='M2.5 10L17.5 2.5L10 10L17.5 17.5L2.5 10Z' fill='currentColor' />
					</svg>
				</button>
			</div>
		</div>
	)
}
