import { useNotesContext } from '@/shared/context/notes-context'
import { TextEditorRef } from '@/shared/types/text-editor'
import { PartialBlock } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import { undo } from 'prosemirror-history'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useThemeToggle } from '../use-theme-toggle/use-theme-toggle'

export const useTextEditor = (ref: React.Ref<TextEditorRef>) => {
	const { activeNote, handleContentChange, handleTitleChange, searchQuery } = useNotesContext()
	const { isDark } = useThemeToggle()
	const [isSaving, setIsSaving] = useState(false)
	const [showSaved, setShowSaved] = useState(false)
	const [localTitle, setLocalTitle] = useState(activeNote?.title || '')

	const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const activeNoteRef = useRef(activeNote)
	const localTitleRef = useRef(localTitle)
	const isMountedRef = useRef(true)

	useEffect(() => {
		activeNoteRef.current = activeNote
	}, [activeNote])

	useEffect(() => {
		localTitleRef.current = localTitle
	}, [localTitle])

	useEffect(() => {
		isMountedRef.current = true
		return () => {
			isMountedRef.current = false
		}
	}, [])

	const editor = useCreateBlockNote({
		initialContent: activeNote?.content ? (JSON.parse(activeNote.content) as PartialBlock[]) : undefined,
	})

	const saveTitle = async (titleToSave: string) => {
		if (titleSaveTimeoutRef.current) {
			clearTimeout(titleSaveTimeoutRef.current)
			titleSaveTimeoutRef.current = null
		}

		const currentNote = activeNoteRef.current
		if (!currentNote) return

		const titleVal = titleToSave.trim() === '' ? 'Untitled Note' : titleToSave
		if (titleVal === currentNote.title) return

		if (isMountedRef.current) {
			setIsSaving(true)
			setShowSaved(false)
		}

		try {
			await handleTitleChange(titleVal, currentNote.$id)
			if (isMountedRef.current) {
				setIsSaving(false)
				setShowSaved(true)

				setTimeout(() => {
					if (isMountedRef.current) setShowSaved(false)
				}, 2000)
			}
		} catch (error) {
			console.error('Failed to save title:', error)
			if (isMountedRef.current) setIsSaving(false)
		}
	}

	const saveContent = async () => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current)
			saveTimeoutRef.current = null
		}

		if (!editor) return
		const jsonContent = JSON.stringify(editor.document)
		const currentNote = activeNoteRef.current
		if (!currentNote || jsonContent === currentNote.content) return

		if (isMountedRef.current) {
			setIsSaving(true)
			setShowSaved(false)
		}

		try {
			await handleContentChange(jsonContent, currentNote.$id)
			if (isMountedRef.current) {
				setIsSaving(false)
				setShowSaved(true)

				setTimeout(() => {
					if (isMountedRef.current) setShowSaved(false)
				}, 2000)
			}
		} catch (error) {
			console.error('Saving error:', error)
			if (isMountedRef.current) setIsSaving(false)
		}
	}

	useImperativeHandle(ref, () => ({
		undo: () => {
			if (!editor) return

			editor.focus()

			const view = editor.prosemirrorView
			if (view) {
				undo(view.state, view.dispatch)
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
		if (!editor) return

		const unsubscribe = editor.onChange(() => {
			const currentNote = activeNoteRef.current
			if (!currentNote) return

			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}

			saveTimeoutRef.current = setTimeout(async () => {
				const jsonContent = JSON.stringify(editor.document)
				const latestNote = activeNoteRef.current
				if (!latestNote || jsonContent === latestNote.content) {
					return
				}

				if (isMountedRef.current) {
					setIsSaving(true)
					setShowSaved(false)
				}

				try {
					await handleContentChange(jsonContent, latestNote.$id)
					if (isMountedRef.current) {
						setIsSaving(false)
						setShowSaved(true)

						setTimeout(() => {
							if (isMountedRef.current) setShowSaved(false)
						}, 2000)
					}
				} catch (error) {
					console.error('Saving error:', error)
					if (isMountedRef.current) setIsSaving(false)
				}
			}, 1000)
		})

		return () => {
			unsubscribe()
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}
		}
	}, [editor, handleContentChange])

	useEffect(() => {
		return () => {
			if (titleSaveTimeoutRef.current) {
				clearTimeout(titleSaveTimeoutRef.current)
				saveTitle(localTitleRef.current)
			}
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
				saveContent()
			}
		}
	}, [editor])

	const onTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const nextTitle = e.target.value
		setLocalTitle(nextTitle)

		if (titleSaveTimeoutRef.current) {
			clearTimeout(titleSaveTimeoutRef.current)
		}

		titleSaveTimeoutRef.current = setTimeout(async () => {
			await saveTitle(nextTitle)
		}, 1000)
	}

	const handleTitleBlur = () => {
		saveTitle(localTitle)
	}

	const handleEditorBlur = (e: React.FocusEvent) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			saveContent()
		}
	}

	return {
		editor,
		isDark,
		isSaving,
		showSaved,
		localTitle,
		activeNote,
		searchQuery,
		onTitleInputChange,
		handleTitleBlur,
		handleEditorBlur,
	}
}
