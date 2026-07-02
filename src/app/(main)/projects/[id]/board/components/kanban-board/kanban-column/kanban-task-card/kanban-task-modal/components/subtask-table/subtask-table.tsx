import { KanbanSubtask, SubtaskStatus } from '@/shared/types/kanban-subtask'
import { Project } from '@/shared/types/project'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { toast } from 'sonner'
import { AssigneeSelect } from '../assignee-select/assignee-select'
import classes from './subtask-table.module.scss'

interface SubtaskTableProps {
	subtasks: KanbanSubtask[]
	project: Project | null
	updateSubtask: (subtaskId: string, data: Partial<KanbanSubtask>) => Promise<void>
	deleteSubtask: (subtaskId: string) => Promise<void>
}

export const SubtaskTable = ({ subtasks, project, updateSubtask, deleteSubtask }: SubtaskTableProps) => {
	const handleSubtaskBlur = (e: React.FocusEvent<HTMLInputElement>, subtaskId: string, originalTitle: string) => {
		const trimmedTitle = e.target.value.trim()

		if (!trimmedTitle) {
			toast.error('Subtask title cannot be empty')
			e.target.value = originalTitle
			return
		}

		if (trimmedTitle !== originalTitle) {
			e.target.value = trimmedTitle
			updateSubtask(subtaskId, { title: trimmedTitle }).catch((err: unknown) => {
				console.error('Failed to update subtask:', err)
				toast.error('Failed to update subtask')
				e.target.value = originalTitle
			})
		}
	}

	return (
		<div className={classes.subtasksTable}>
			<div className={classes.tableHeaderRow}>
				<div className={classes.colWork}>Work</div>
				<div className={classes.colAssignee}>Assignee</div>
				<div className={classes.colStatus}>Status</div>
				<div className={classes.colAction}></div>
			</div>

			<div className={classes.tableBody}>
				{subtasks.map(subtask => (
					<div key={subtask.$id} className={classes.tableRow}>
						<div className={classes.colWork}>
							<input
								type='text'
								defaultValue={subtask.title}
								onBlur={e => handleSubtaskBlur(e, subtask.$id, subtask.title)}
								onKeyDown={e => {
									if (e.key === 'Enter') e.currentTarget.blur()
								}}
								className={classes.subtaskTitleInput}
								title={subtask.title}
							/>
						</div>

						<div className={classes.colAssignee}>
							<AssigneeSelect
								teamId={project?.teamId}
								currentAssigneeId={subtask.assigneeId}
								currentAssigneeName={subtask.assigneeName}
								onAssigneeChange={(uid, uname) => {
									updateSubtask(subtask.$id, { assigneeId: uid, assigneeName: uname })
								}}
							/>
						</div>

						<div className={classes.colStatus}>
							<select
								value={subtask.status}
								onChange={e => updateSubtask(subtask.$id, { status: e.target.value as SubtaskStatus })}
								className={classes.statusSelect}
							>
								<option value='todo'>TO DO</option>
								<option value='done'>DONE</option>
							</select>
						</div>

						<div className={classes.colAction}>
							<button
								onClick={() => deleteSubtask(subtask.$id)}
								className={classes.deleteSubtaskBtn}
								title='Delete subtask'
							>
								<DeleteIcon />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
