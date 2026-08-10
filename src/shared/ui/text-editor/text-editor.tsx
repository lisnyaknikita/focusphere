'use client'

import { useTextEditor } from '@/shared/hooks/use-text-editor/use-text-editor'
import { TextEditorRef } from '@/shared/types/text-editor'
import { filterSuggestionItems } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { getDefaultReactSlashMenuItems, SuggestionMenuController } from '@blocknote/react'
import { forwardRef, useMemo } from 'react'
import { EmptyIcon } from '../icons/empty-icon'
import classes from './text-editor.module.scss'

export const TextEditor = forwardRef<TextEditorRef>((props, ref) => {
	const {
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
	} = useTextEditor(ref)

	const customSlashMenuItems = useMemo(() => {
		if (!editor) return []

		const defaultItems = getDefaultReactSlashMenuItems(editor)

		const excludedTitles = ['Video', 'Audio', 'File', 'Heading 4', 'Heading 5', 'Heading 6']

		return defaultItems.filter(item => {
			if (excludedTitles.includes(item.title)) {
				return false
			}

			if (item.title.toLowerCase().startsWith('heading') && /[4-6]/.test(item.title)) {
				return false
			}

			return true
		})
	}, [editor])

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

	const handleWrapperClick = () => {
		if (editor) {
			editor.focus()
		}
	}

	return (
		<div className={classes.editor}>
			<div className={classes.scrollContainer} onClick={handleWrapperClick}>
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
						onBlur={handleTitleBlur}
						placeholder='Title'
					/>
					<div
						className={classes.bnWrapper}
						onBlur={handleEditorBlur}
						onClick={handleWrapperClick}
						onTouchEnd={handleWrapperClick}
					>
						<BlockNoteView
							editor={editor}
							theme={isDark ? 'dark' : 'light'}
							sideMenu={true}
							formattingToolbar={true}
							slashMenu={false}
						>
							<SuggestionMenuController
								triggerCharacter={'/'}
								getItems={async query => filterSuggestionItems(customSlashMenuItems, query)}
							/>
						</BlockNoteView>
					</div>
				</div>
			</div>
		</div>
	)
})

TextEditor.displayName = 'TextEditor'
