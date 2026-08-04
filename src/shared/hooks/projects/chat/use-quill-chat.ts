'use client'

import { FULL_TOOLBAR_OPTIONS } from '@/app/(main)/projects/[id]/chat/components/chat-area/components/editor/quill-toolbar/quill-toolbar'
import { KanbanTask } from '@/shared/types/kanban-task'
import { processImageUpload } from '@/shared/utils/quill/process-image-upload'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import Quill, { QuillOptions } from 'quill'
import { useEffect, useMemo, useRef, useState } from 'react'

interface UseQuillChatProps {
	initialContent?: string
	tasks: KanbanTask[]
	onSend: (content: string) => void
	onTyping?: () => void
	onStopTyping?: () => void
}

export const useQuillChat = ({ initialContent, tasks, onSend, onTyping, onStopTyping }: UseQuillChatProps) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [dropdownSearch, setDropdownSearch] = useState('')
	const [dropdownIndex, setDropdownIndex] = useState(0)
	const [hashIndex, setHashIndex] = useState(-1)

	const containerRef = useRef<HTMLDivElement>(null)
	const quillRef = useRef<Quill | null>(null)

	const onSendRef = useRef(onSend)
	onSendRef.current = onSend

	const onTypingRef = useRef(onTyping)
	onTypingRef.current = onTyping

	const onStopTypingRef = useRef(onStopTyping)
	onStopTypingRef.current = onStopTyping

	const filteredTasks = useMemo(() => {
		if (!dropdownSearch) return tasks
		const search = dropdownSearch.toLowerCase()
		return tasks.filter(
			task => task.taskCode?.toLowerCase().includes(search) || task.title?.toLowerCase().includes(search)
		)
	}, [tasks, dropdownSearch])

	const stateRef = useRef({ isDropdownOpen, filteredTasks, dropdownIndex, hashIndex })
	stateRef.current = { isDropdownOpen, filteredTasks, dropdownIndex, hashIndex }

	const { refs: dropdownRefs, floatingStyles: dropdownFloatingStyles } = useFloating({
		open: isDropdownOpen,
		placement: 'bottom-start',
		strategy: 'fixed',
		whileElementsMounted: autoUpdate,
		middleware: [offset(4), flip(), shift()],
	})

	useEffect(() => {
		if (!isDropdownOpen) return

		const handleOutsideClick = (event: MouseEvent) => {
			const dropdownEl = dropdownRefs.floating.current
			if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
				setIsDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleOutsideClick)
		return () => document.removeEventListener('mousedown', handleOutsideClick)
	}, [isDropdownOpen, dropdownRefs])

	const handleSend = () => {
		if (!quillRef.current) return
		const content = quillRef.current.root.innerHTML.trim()
		if (content === '<p><br></p>' || content === '' || quillRef.current.getText().trim() === '') return

		onStopTypingRef.current?.()
		onSendRef.current(content)
		quillRef.current.setContents([])
		quillRef.current.focus()
	}

	const handleSelectTask = (task: KanbanTask) => {
		if (!quillRef.current) return
		const quill = quillRef.current
		const { hashIndex: activeHashIndex } = stateRef.current
		const range = quill.getSelection()

		if (range && activeHashIndex !== -1) {
			const lengthToRemove = range.index - activeHashIndex
			quill.deleteText(activeHashIndex, lengthToRemove)
			const insertText = `#${task.taskCode} `
			quill.insertText(activeHashIndex, insertText)
			quill.setSelection(activeHashIndex + insertText.length)
		}

		setIsDropdownOpen(false)
		setDropdownSearch('')
		setDropdownIndex(0)
	}

	useEffect(() => {
		if (!containerRef.current) return

		containerRef.current.innerHTML = ''
		const editorContainer = document.createElement('div')
		containerRef.current.appendChild(editorContainer)

		const options: QuillOptions = {
			placeholder: 'Write a message... (Type # to mention a task)',
			theme: 'snow',
			modules: {
				toolbar: FULL_TOOLBAR_OPTIONS,
				keyboard: {
					bindings: {
						enter: {
							key: 'Enter',
							shiftKey: false,
							handler: () => {
								if (stateRef.current.isDropdownOpen) return true
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

		if (initialContent) {
			quill.clipboard.dangerouslyPasteHTML(initialContent)
		}

		const toolbar = quill.getModule('toolbar') as {
			addHandler: (name: string, handler: () => void) => void
		} | null

		if (toolbar) {
			toolbar.addHandler('image', () => {
				const input = document.createElement('input')
				input.setAttribute('type', 'file')
				input.setAttribute('accept', 'image/png, image/jpeg, image/gif, image/webp')
				input.click()

				input.onchange = () => {
					const file = input.files?.[0]
					if (file) {
						processImageUpload(file, quill)
					}
				}
			})
		}

		const handlePaste = (e: ClipboardEvent) => {
			const clipboardItems = e.clipboardData?.items
			if (!clipboardItems) return

			for (let i = 0; i < clipboardItems.length; i++) {
				const item = clipboardItems[i]
				if (item.type.startsWith('image/')) {
					e.preventDefault()
					const file = item.getAsFile()
					if (file) {
						processImageUpload(file, quill)
					}
					break
				}
			}
		}

		const handleDrop = (e: DragEvent) => {
			const files = e.dataTransfer?.files
			if (files && files.length > 0) {
				const file = files[0]
				if (file.type.startsWith('image/')) {
					e.preventDefault()
					e.stopPropagation()
					processImageUpload(file, quill)
				}
			}
		}

		const editorRoot = quill.root
		editorRoot.addEventListener('paste', handlePaste)
		editorRoot.addEventListener('drop', handleDrop)

		quill.on('text-change', (_delta, _oldDelta, source) => {
			if (source === 'user') {
				onTypingRef.current?.()
			}
			setTimeout(() => {
				if (!quillRef.current) return
				const range = quill.getSelection()
				if (!range) {
					setIsDropdownOpen(false)
					return
				}

				const textBefore = quill.getText(0, range.index)
				const hashIdx = textBefore.lastIndexOf('#')

				if (hashIdx !== -1 && hashIdx >= textBefore.length - 15) {
					const charBeforeHash = hashIdx > 0 ? textBefore[hashIdx - 1] : ' '
					const isWordStart = /\s/.test(charBeforeHash)
					const textBetween = textBefore.substring(hashIdx + 1)
					const hasSpaceBetween = /\s/.test(textBetween)

					if (isWordStart && !hasSpaceBetween) {
						setIsDropdownOpen(true)
						setDropdownSearch(textBetween)
						setHashIndex(hashIdx)

						const bounds = quill.getBounds(hashIdx)
						if (bounds && containerRef.current) {
							const qlContainer = containerRef.current.querySelector('.ql-container')
							if (qlContainer) {
								const qlRect = qlContainer.getBoundingClientRect()
								const caretX = qlRect.left + bounds.left
								const caretY = qlRect.top + bounds.top

								dropdownRefs.setReference({
									getBoundingClientRect: () => ({
										width: bounds.width || 0,
										height: bounds.height || 20,
										x: caretX,
										y: caretY,
										top: caretY,
										left: caretX,
										right: caretX + (bounds.width || 0),
										bottom: caretY + (bounds.height || 20),
									}),
								})
							}
						}
						return
					}
				}
				setIsDropdownOpen(false)
			}, 0)
		})

		const handleQuillKeyDown = (e: KeyboardEvent) => {
			const { isDropdownOpen: isOpen, filteredTasks: currentTasks, dropdownIndex: activeIndex } = stateRef.current

			if (isOpen && currentTasks.length > 0) {
				if (e.key === 'ArrowDown') {
					e.preventDefault()
					e.stopPropagation()
					setDropdownIndex(prev => (prev + 1) % currentTasks.length)
				} else if (e.key === 'ArrowUp') {
					e.preventDefault()
					e.stopPropagation()
					setDropdownIndex(prev => (prev - 1 + currentTasks.length) % currentTasks.length)
				} else if (e.key === 'Enter') {
					e.preventDefault()
					e.stopPropagation()
					handleSelectTask(currentTasks[activeIndex])
				} else if (e.key === 'Escape') {
					e.preventDefault()
					e.stopPropagation()
					setIsDropdownOpen(false)
				}
			}
		}

		quill.root.addEventListener('keydown', handleQuillKeyDown, true)
		setTimeout(() => {
			if (quillRef.current) {
				quillRef.current.root.focus({ preventScroll: true })
			}
		}, 100)

		return () => {
			editorRoot.removeEventListener('paste', handlePaste)
			editorRoot.removeEventListener('drop', handleDrop)
			quillRef.current = null
			if (containerRef.current) containerRef.current.innerHTML = ''
		}
	}, [])

	return {
		containerRef,
		quillRef,
		isDropdownOpen,
		dropdownRefs,
		dropdownFloatingStyles,
		filteredTasks,
		dropdownIndex,
		handleSend,
		handleSelectTask,
	}
}
