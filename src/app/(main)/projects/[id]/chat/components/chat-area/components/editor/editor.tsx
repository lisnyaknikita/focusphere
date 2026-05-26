'use client'

import { useQuillChat } from '@/shared/hooks/projects/chat/use-quill-chat'
import { KanbanTask } from '@/shared/types/kanban-task'
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
		isTooltipOpen,
		tooltipRefs,
		tooltipStyles,
		getReferenceProps,
		getFloatingProps,
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
					<button
						ref={tooltipRefs.setReference}
						className={classes.sendButton}
						onClick={handleSend}
						disabled={disabled}
						{...getReferenceProps()}
					>
						<SendIcon />
						{isTooltipOpen && (
							<div
								ref={tooltipRefs.setFloating}
								style={{
									...tooltipStyles,
									background: 'var(--save-button-bg)',
									color: 'var(--save-button-text)',
									padding: '4px 8px',
									borderRadius: '5px',
									fontSize: '13px',
									fontWeight: 700,
									zIndex: 1000,
									whiteSpace: 'nowrap',
								}}
								{...getFloatingProps()}
							>
								Send message (Enter)
							</div>
						)}
					</button>
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
