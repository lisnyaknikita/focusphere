'use client'

import { useNotesContext } from '@/shared/context/notes-context'
import Quill, { QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'
import { EmptyIcon } from '../icons/empty-icon'
import classes from './text-editor.module.scss'

export const TextEditor = () => {
	const { activeNote, handleContentChange, handleTitleChange, searchQuery } = useNotesContext()
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
		if (searchQuery && searchQuery.trim() !== '') {
			return <div className={classes.emptyBySearchEditor} />
		}

		return (
			<div className={classes.emptyEditor}>
				<div className={classes.emptyContent}>
					<div className={classes.icon}>
						<EmptyIcon />
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
