'use client'

import { useProject } from '@/shared/context/project-context'
import Quill, { QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'
import classes from './text-editor.module.scss'

export const TextEditor = () => {
	const { activeNote, handleContentChange, handleTitleChange } = useProject()
	const containerRef = useRef<HTMLDivElement>(null)
	const quillRef = useRef<Quill | null>(null)

	useEffect(() => {
		if (!containerRef.current) return

		containerRef.current.innerHTML = ''
		const editorContainer = document.createElement('div')
		containerRef.current.appendChild(editorContainer)

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

		const handleTextChange = (_delta: unknown, _oldDelta: unknown, source: string) => {
			if (source === 'user' && activeNote?.$id) {
				const html = quill.root.innerHTML
				handleContentChange(html, activeNote.$id)
			}
		}

		quill.on('text-change', handleTextChange)

		return () => {
			quill.off('text-change', handleTextChange)
			if (containerRef.current) {
				containerRef.current.innerHTML = ''
			}
			quillRef.current = null
		}
	}, [activeNote?.$id])

	if (!activeNote) {
		return (
			<div className={classes.emptyEditor}>
				<div className={classes.emptyContent}>
					<div className={classes.icon}>
						<svg viewBox='0 0 20 21' width={40} height={42} xmlns='http://www.w3.org/2000/svg'>
							<path
								d='m15.546 1.275-10.16 10.16c-0.38805 0.3859-0.69568 0.845-0.9051 1.3507-0.20941 0.5056-0.31644 1.0478-0.3149 1.5951v1.1192c0 0.221 0.0878 0.4329 0.24408 0.5892s0.36824 0.2441 0.58925 0.2441h1.1192c0.5473 0.0015 1.0895-0.1055 1.5951-0.3149s0.96475-0.5171 1.3507-0.9051l10.16-10.16c0.4869-0.48819 0.7604-1.1496 0.7604-1.8392s-0.2735-1.351-0.7604-1.8392c-0.4953-0.47342-1.1541-0.73763-1.8392-0.73763-0.6852 0-1.3439 0.2642-1.8392 0.73763zm2.5 2.5-10.16 10.16c-0.4699 0.467-1.105 0.7299-1.7675 0.7316h-0.28583v-0.2858c0.00173-0.6625 0.26464-1.2976 0.73166-1.7675l10.16-10.16c0.1779-0.17004 0.4146-0.26492 0.6608-0.26492 0.2461 0 0.4828 0.09488 0.6608 0.26492 0.175 0.17543 0.2732 0.41308 0.2732 0.66083 0 0.24776-0.0982 0.48541-0.2732 0.66084z'
								fill='var(--text)'
							/>
							<path
								d='m19.167 7.9825c-0.2211 0-0.433 0.0878-0.5893 0.24408s-0.2441 0.36824-0.2441 0.58926v4.1842h-3.3333c-0.6631 0-1.2989 0.2634-1.7678 0.7322-0.4688 0.4689-0.7322 1.1047-0.7322 1.7678v3.3333h-8.3333c-0.66304 0-1.2989-0.2634-1.7678-0.7322-0.46884-0.4689-0.73223-1.1047-0.73223-1.7678v-11.667c0-0.66304 0.26339-1.2989 0.73223-1.7678s1.1047-0.73223 1.7678-0.73223h7.535c0.221 0 0.4329-0.0878 0.5892-0.24408s0.2441-0.36824 0.2441-0.58926c0-0.22101-0.0878-0.43297-0.2441-0.58925-0.1563-0.15628-0.3682-0.24408-0.5892-0.24408h-7.535c-1.1047 0.001323-2.1637 0.44074-2.9448 1.2218-0.78112 0.78111-1.2205 1.8402-1.2218 2.9448v11.667c0.0013232 1.1047 0.44074 2.1637 1.2218 2.9448 0.78111 0.7811 1.8402 1.2206 2.9448 1.2219h9.4525c0.5474 0.0015 1.0897-0.1055 1.5955-0.3149s0.965-0.517 1.3511-0.9051l2.2134-2.215c0.3881-0.386 0.6958-0.845 0.9054-1.3507 0.2095-0.5056 0.3167-1.0478 0.3154-1.5951v-5.3034c0-0.22102-0.0878-0.43298-0.2441-0.58926s-0.3682-0.24408-0.5892-0.24408zm-3.7792 10.119c-0.335 0.3341-0.7586 0.5655-1.2208 0.6666v-3.2683c0-0.221 0.0878-0.433 0.244-0.5893 0.1563-0.1562 0.3683-0.244 0.5893-0.244h3.2708c-0.1031 0.4612-0.3341 0.8841-0.6666 1.22l-2.2167 2.215z'
								fill='var(--text)'
							/>
						</svg>
					</div>
					<h3>No note selected</h3>
					<p>Select a note from the list or create a new one to start writing</p>
				</div>
			</div>
		)
	}

	return (
		<div className={classes.editor}>
			<div className={classes.editorInner}>
				<div ref={containerRef} style={{ height: '100%' }} className='ql-custom' />
				<input
					type='text'
					className={classes.titleInput}
					value={activeNote.title}
					onChange={e => handleTitleChange(e.target.value, activeNote.$id)}
					onBlur={e => {
						if (e.target.value.trim() === '') {
							handleTitleChange('Untitled Note', activeNote.$id)
						}
					}}
					placeholder='Note Title'
				/>
				<div className={classes.additionalButtons}></div>
			</div>
		</div>
	)
}
