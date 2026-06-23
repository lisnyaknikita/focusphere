'use client'

import { useQuillChat } from '@/shared/hooks/projects/chat/use-quill-chat'
import { KanbanTask } from '@/shared/types/kanban-task'
import { ActionTooltip } from '@/shared/ui/action-tooltip/action-tooltip'
import { SendIcon } from '@/shared/ui/icons/send-icon'
import 'quill/dist/quill.snow.css'
import { forwardRef, useImperativeHandle } from 'react'
import { TaskDropdown } from './components/task-dropdown/task-dropdown'
import classes from './editor.module.scss'

interface EditorProps {
	onSend: (content: string) => void
	disabled?: boolean
	tasks?: KanbanTask[]
}

export interface EditorRef {
	focus: () => void
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ onSend, disabled, tasks = [] }, ref) => {
	const {
		containerRef,
		quillRef,
		isDropdownOpen,
		dropdownRefs,
		dropdownFloatingStyles,
		filteredTasks,
		dropdownIndex,
		handleSend,
		handleSelectTask,
	} = useQuillChat({ tasks, onSend })

	useImperativeHandle(ref, () => ({
		focus: () => {
			if (quillRef.current) {
				quillRef.current.focus()
			}
		},
	}))

	return (
		<div className={classes.editor} style={{ position: 'relative' }}>
			<div className={classes.editorInner}>
				<div ref={containerRef} className='ql-chat-custom' />
				<div className={classes.additionalButtons}>
					<ActionTooltip text='Send message (Enter)'>
						{(setRef, refProps) => (
							<button
								ref={setRef}
								type='button'
								className={classes.sendButton}
								onClick={handleSend}
								disabled={disabled}
								{...refProps}
							>
								<SendIcon />
							</button>
						)}
					</ActionTooltip>
				</div>
			</div>

			{isDropdownOpen && (
				<TaskDropdown
					floatingRef={dropdownRefs.setFloating}
					floatingStyles={dropdownFloatingStyles}
					filteredTasks={filteredTasks}
					dropdownIndex={dropdownIndex}
					onSelectTask={handleSelectTask}
				/>
			)}
		</div>
	)
})

Editor.displayName = 'Editor'
