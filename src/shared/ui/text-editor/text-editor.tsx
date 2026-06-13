'use client'

import { useNotesContext } from '@/shared/context/notes-context'
import { useThemeToggle } from '@/shared/hooks/use-theme-toggle/use-theme-toggle'
import { BlockNoteInternals, TextEditorRef } from '@/shared/types/text-editor'
import { PartialBlock } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useCreateBlockNote } from '@blocknote/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EmptyIcon } from '../icons/empty-icon'
import classes from './text-editor.module.scss'

export const TextEditor = forwardRef<TextEditorRef>((props, ref) => {
	const { activeNote, handleContentChange, handleTitleChange, searchQuery } = useNotesContext()
	const { isDark } = useThemeToggle()
	const [isSaving, setIsSaving] = useState(false)
	const [showSaved, setShowSaved] = useState(false)
	const [localTitle, setLocalTitle] = useState(activeNote?.title || '')

	const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const editor = useCreateBlockNote({
		initialContent: activeNote?.content ? (JSON.parse(activeNote.content) as PartialBlock[]) : undefined,
	})

	useImperativeHandle(ref, () => ({
		undo: () => {
			if (!editor) return

			editor.focus()

			const internals = editor as unknown as BlockNoteInternals
			const targetDOM =
				internals._prosemirrorView?.dom || internals.editorView?.dom || document.querySelector('.bn-editor')

			if (targetDOM) {
				const beforeInputEvent = new InputEvent('beforeinput', {
					inputType: 'historyUndo',
					bubbles: true,
					cancelable: true,
				})
				targetDOM.dispatchEvent(beforeInputEvent)

				const undoEvent = new KeyboardEvent('keydown', {
					key: 'z',
					code: 'KeyZ',
					keyCode: 90,
					which: 90,
					ctrlKey: true,
					metaKey: true,
					bubbles: true,
					cancelable: true,
				})
				targetDOM.dispatchEvent(undoEvent)
			}
		},
	}))

	useEffect(() => {
		if (editor) {
			const timer = setTimeout(() => {
				editor.focus()
			}, 150)
			return () => clearTimeout(timer)
		}
	}, [editor])

	useEffect(() => {
		if (titleSaveTimeoutRef.current) {
			clearTimeout(titleSaveTimeoutRef.current)
		}

		if (activeNote) {
			setLocalTitle(activeNote.title)
		}
	}, [activeNote?.$id])

	useEffect(() => {
		if (!activeNote || !editor) return

		const unsubscribe = editor.onChange(() => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}

			saveTimeoutRef.current = setTimeout(async () => {
				const jsonContent = JSON.stringify(editor.document)

				if (jsonContent === activeNote.content) {
					return
				}

				setIsSaving(true)
				setShowSaved(false)

				try {
					await handleContentChange(jsonContent, activeNote.$id)

					setIsSaving(false)
					setShowSaved(true)

					setTimeout(() => {
						setShowSaved(false)
					}, 2000)
				} catch (error) {
					console.error('Saving error:', error)
					setIsSaving(false)
				}
			}, 1000)
		})

		return () => {
			unsubscribe()
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}
		}
	}, [editor, activeNote?.$id, activeNote?.content, handleContentChange])

	const onTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const nextTitle = e.target.value
		setLocalTitle(nextTitle)

		if (titleSaveTimeoutRef.current) {
			clearTimeout(titleSaveTimeoutRef.current)
		}

		titleSaveTimeoutRef.current = setTimeout(async () => {
			if (nextTitle === activeNote?.title) return

			setIsSaving(true)
			setShowSaved(false)

			try {
				await handleTitleChange(nextTitle, activeNote!.$id)
				setIsSaving(false)
				setShowSaved(true)

				setTimeout(() => {
					setShowSaved(false)
				}, 2000)
			} catch (error) {
				console.error('Failed to save title:', error)
				setIsSaving(false)
			}
		}, 1000)
	}

	useEffect(() => {
		return () => {
			if (titleSaveTimeoutRef.current) clearTimeout(titleSaveTimeoutRef.current)
		}
	}, [])

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
			<div className={classes.scrollContainer}>
				<div className={classes.contentWrapper}>
					<div className={classes.saveStatus}>
						{isSaving && <span className={classes.saving}>Saving...</span>}
						{!isSaving && showSaved && <span className={classes.saved}>✓ Saved</span>}
					</div>
					<input
						type='text'
						className={classes.titleInput}
						value={localTitle}
						onChange={onTitleInputChange}
						placeholder='Title'
					/>
					<div className={classes.bnWrapper}>
						<BlockNoteView editor={editor} theme={isDark ? 'dark' : 'light'} sideMenu={true} formattingToolbar={true} />
					</div>
				</div>
			</div>
		</div>
	)
})

TextEditor.displayName = 'TextEditor'
