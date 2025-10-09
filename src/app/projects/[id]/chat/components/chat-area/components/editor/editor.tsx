'use client'

import Quill, { type QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef } from 'react'
import classes from './editor.module.scss'

export const Editor = () => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		const container = containerRef.current
		const editorContainer = container.appendChild(container.ownerDocument.createElement('div'))

		const options: QuillOptions = {
			theme: 'snow',
		}

		const quill = new Quill(editorContainer, options)

		return () => {
			if (container) {
				container.innerHTML = ''
			}
		}
	})

	return (
		<div className={classes.editor}>
			<div className={classes.editorInner}>
				<div ref={containerRef} />
			</div>
		</div>
	)
}
