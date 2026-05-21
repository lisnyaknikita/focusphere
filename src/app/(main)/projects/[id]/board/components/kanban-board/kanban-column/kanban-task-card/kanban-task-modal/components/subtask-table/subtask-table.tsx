import { KanbanSubtask, SubtaskStatus } from '@/shared/types/kanban-subtask'
import { Project } from '@/shared/types/project'
import { DeleteIcon } from '@/shared/ui/icons/delete-icon'
import { AssigneeSelect } from '../assignee-select/assignee-select'
import classes from './subtask-table.module.scss'

interface SubtaskTableProps {
	subtasks: KanbanSubtask[]
	project: Project | null
	updateSubtask: (subtaskId: string, data: Partial<KanbanSubtask>) => Promise<void>
	deleteSubtask: (subtaskId: string) => Promise<void>
}

export const SubtaskTable = ({ subtasks, project, updateSubtask, deleteSubtask }: SubtaskTableProps) => {
	const handleSubtaskBlur = (subtaskId: string, originalTitle: string, currentTitle: string) => {
		if (currentTitle.trim() !== '' && currentTitle !== originalTitle) {
			updateSubtask(subtaskId, { title: currentTitle })
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
								onBlur={e => handleSubtaskBlur(subtask.$id, subtask.title, e.target.value)}
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
