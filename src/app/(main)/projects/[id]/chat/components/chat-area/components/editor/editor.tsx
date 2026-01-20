'use client'

import { useProject } from '@/shared/context/project-context'
import Quill, { type QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'
import classes from './editor.module.scss'

const Editor = () => {
	const { activeNote, handleContentChange } = useProject()
	const containerRef = useRef<HTMLDivElement>(null)
	const quillRef = useRef<Quill | null>(null)

	useEffect(() => {
		if (!containerRef.current || quillRef.current) return

		const container = containerRef.current
		const editorContainer = document.createElement('div')
		container.appendChild(editorContainer)

		const options: QuillOptions = {
			placeholder: 'Start writing...',
			theme: 'snow',
			modules: {
				toolbar: [
					[{ header: [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ list: 'ordered' }, { list: 'bullet' }],
					['link', 'blockquote', 'code-block'],
					['clean'],
				],
			},
		}

		const quill = new Quill(editorContainer, options)
		quillRef.current = quill

		if (activeNote) {
			quill.root.innerHTML = activeNote.content || ''
		}

		quill.on('text-change', () => {
			const html = quill.root.innerHTML
			handleContentChange(html, activeNote?.$id || '')
		})

		return () => {
			container.innerHTML = ''
			quillRef.current = null
		}
	}, [])

	useEffect(() => {
		if (quillRef.current && activeNote) {
			const editorHtml = quillRef.current.root.innerHTML

			if (editorHtml !== activeNote.content) {
				quillRef.current.root.innerHTML = activeNote.content || ''
			}
		}
	}, [activeNote?.$id])

	const handleSend = () => {
		const text = quillRef.current?.getText().trim()
		if (!text) return
		console.log('Message: ', text)
		quillRef.current?.setText('')
	}

	return (
		<div className={classes.editor}>
			<div className={classes.editorInner}>
				<div ref={containerRef} style={{ height: '100%' }} className='ql-custom' />
				<div className={classes.additionalButtons}>
					<button className={classes.sendButton} onClick={handleSend}>
						<svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<g clipPath='url(#clip0_2382_2181)'>
								<path
									d='M12.7847 5.09055L2.31325 0.164299C1.72175 -0.123285 1.02466 -0.024118 0.535246 0.415715C0.0446624 0.857299 -0.125671 1.5433 0.100662 2.1628C0.110579 2.18788 2.67375 7.00213 2.67375 7.00213C2.67375 7.00213 0.157829 11.8152 0.149079 11.8397C-0.0766709 12.4598 0.0954123 13.1446 0.585996 13.5856C0.889912 13.858 1.27375 13.9986 1.65991 13.9986C1.8985 13.9986 2.13766 13.945 2.3605 13.8359L12.7858 8.91372C13.5354 8.56197 14.0009 7.8293 14.0003 7.00155C14.0003 6.17322 13.5331 5.44055 12.7847 5.09055ZM1.18566 1.73055C1.1145 1.48847 1.26616 1.32805 1.31575 1.28255C1.36766 1.23647 1.55725 1.09355 1.80458 1.21488C1.8075 1.21605 12.2894 6.14697 12.2894 6.14697C12.4288 6.2123 12.5449 6.30447 12.6342 6.41647H3.68408L1.18566 1.73055ZM12.2888 7.85788L1.85416 12.7847C1.60625 12.9066 1.41725 12.7643 1.36533 12.717C1.31516 12.6727 1.1635 12.5111 1.23525 12.2685L3.68641 7.58313H12.6377C12.5484 7.69688 12.43 7.79138 12.2888 7.85788Z'
									fill='var(--text)'
								/>
							</g>
							<defs>
								<clipPath id='clip0_2382_2181'>
									<rect width='14' height='14' fill='var(--text)' />
								</clipPath>
							</defs>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}

export default Editor
