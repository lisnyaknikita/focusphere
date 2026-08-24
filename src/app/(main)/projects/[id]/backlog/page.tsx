'use client'

import { useProject } from '@/shared/context/project-context'
import { useBacklogDnd } from '@/shared/hooks/projects/kanban-board/use-backlog-dnd'
import { useBacklogState } from '@/shared/hooks/projects/kanban-board/use-backlog-state'
import { Sprint } from '@/shared/types/sprint'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { ActiveSprintSection } from './components/active-sprint-section/active-sprint-section'
import { BacklogHeader } from './components/backlog-header/backlog-header'
import { BacklogModals } from './components/backlog-modals/backlog-modals'
import { BacklogRow } from './components/backlog-row/backlog-row'
import { PlannedSprintSection } from './components/planned-sprint-section/planned-sprint-section'
import { UnassignedBacklogSection } from './components/unassigned-backlog-section/unassigned-backlog-section'
import classes from './page.module.scss'

export default function BacklogPage() {
	const { project, isLoading: isProjectLoading } = useProject()

	const {
		tasks,
		sprints,
		activeSprint,
		plannedSprints,
		isLoading: isBacklogLoading,
		updateTask,
		reorderBacklogTasks,
		addingToSprintId,
		setAddingToSprintId,
		inlineTitle,
		setInlineTitle,
		taskToDelete,
		setTaskToDelete,
		isSubmitting,
		isCreateSprintModalOpen,
		setIsCreateSprintModalOpen,
		editingSprint,
		setEditingSprint,
		sprintToComplete,
		setSprintToComplete,
		sprintToDelete,
		setSprintToDelete,
		handleInlineSubmit,
		handleDeleteConfirm,
		handleStartSprint,
		handleCompleteSprintConfirm,
		handleDeleteSprintConfirm,
	} = useBacklogState(project!)

	const [sprintToStart, setSprintToStart] = useState<Sprint | null>(null)

	const { sensors, activeDragTask, getIsContainerHovered, handleDragStart, handleDragOver, handleDragEnd } =
		useBacklogDnd({ tasks, reorderBacklogTasks })

	const handleStartSprintConfirm = async () => {
		if (!sprintToStart) return
		await handleStartSprint(sprintToStart.$id)
		setSprintToStart(null)
	}

	const isLoading = isProjectLoading || isBacklogLoading

	if (isLoading) {
		return (
			<div className={classes.backlogPage}>
				<div className={classes.loaderWrapper}>
					<BeatLoader color='#aaa' size={10} />
				</div>
			</div>
		)
	}

	const unassignedTasks = tasks.filter(t => !t.sprintId).sort((a, b) => (a.position || 0) - (b.position || 0))
	const activeTasks = activeSprint
		? tasks.filter(t => t.sprintId === activeSprint.$id).sort((a, b) => (a.position || 0) - (b.position || 0))
		: []

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className={classes.backlogPage}>
				<div className={classes.inner}>
					<BacklogHeader
						sprints={sprints.length}
						tasks={tasks.length}
						setIsCreateSprintModalOpen={setIsCreateSprintModalOpen}
						setAddingToSprintId={setAddingToSprintId}
					/>

					{activeSprint && (
						<ActiveSprintSection
							activeSprint={activeSprint}
							activeTasks={activeTasks}
							isHighlighted={getIsContainerHovered(activeSprint.$id)}
							addingToSprintId={addingToSprintId}
							inlineTitle={inlineTitle}
							isSubmitting={isSubmitting}
							setEditingSprint={setEditingSprint}
							setSprintToComplete={setSprintToComplete}
							setAddingToSprintId={setAddingToSprintId}
							setInlineTitle={setInlineTitle}
							setTaskToDelete={setTaskToDelete}
							updateTask={updateTask}
							handleInlineSubmit={handleInlineSubmit}
						/>
					)}

					{plannedSprints.map(sprint => {
						const sprintTasks = tasks
							.filter(t => t.sprintId === sprint.$id)
							.sort((a, b) => (a.position || 0) - (b.position || 0))

						return (
							<PlannedSprintSection
								key={sprint.$id}
								sprint={sprint}
								sprintTasks={sprintTasks}
								isHighlighted={getIsContainerHovered(sprint.$id)}
								addingToSprintId={addingToSprintId}
								inlineTitle={inlineTitle}
								isSubmitting={isSubmitting}
								setEditingSprint={setEditingSprint}
								setSprintToDelete={setSprintToDelete}
								setSprintToStart={setSprintToStart}
								setAddingToSprintId={setAddingToSprintId}
								setInlineTitle={setInlineTitle}
								setTaskToDelete={setTaskToDelete}
								updateTask={updateTask}
								handleInlineSubmit={handleInlineSubmit}
							/>
						)
					})}

					<UnassignedBacklogSection
						unassignedTasks={unassignedTasks}
						isHighlighted={getIsContainerHovered(null)}
						addingToSprintId={addingToSprintId}
						inlineTitle={inlineTitle}
						isSubmitting={isSubmitting}
						setAddingToSprintId={setAddingToSprintId}
						setInlineTitle={setInlineTitle}
						setTaskToDelete={setTaskToDelete}
						updateTask={updateTask}
						handleInlineSubmit={handleInlineSubmit}
					/>
				</div>

				<DragOverlay adjustScale={false}>
					{activeDragTask && (
						<BacklogRow task={activeDragTask} onUpdateTask={updateTask} onDeleteRequest={setTaskToDelete} />
					)}
				</DragOverlay>

				<BacklogModals
					projectId={project!.$id}
					isCreateSprintModalOpen={isCreateSprintModalOpen}
					setIsCreateSprintModalOpen={setIsCreateSprintModalOpen}
					editingSprint={editingSprint}
					setEditingSprint={setEditingSprint}
					sprintToComplete={sprintToComplete}
					setSprintToComplete={setSprintToComplete}
					sprintToDelete={sprintToDelete}
					setSprintToDelete={setSprintToDelete}
					sprintToStart={sprintToStart}
					setSprintToStart={setSprintToStart}
					taskToDelete={taskToDelete}
					setTaskToDelete={setTaskToDelete}
					handleCompleteSprintConfirm={handleCompleteSprintConfirm}
					handleDeleteSprintConfirm={handleDeleteSprintConfirm}
					handleStartSprintConfirm={handleStartSprintConfirm}
					handleDeleteConfirm={handleDeleteConfirm}
				/>
			</div>
		</DndContext>
	)
}
