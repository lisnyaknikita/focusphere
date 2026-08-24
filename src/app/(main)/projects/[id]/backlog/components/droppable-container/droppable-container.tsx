import { useDroppable } from '@dnd-kit/core'
import classes from './droppable-container.module.scss'

interface DroppableContainerProps {
	id: string
	children: React.ReactNode
	className?: string
	isHighlighted?: boolean
}

export const DroppableContainer = ({ id, children, className, isHighlighted }: DroppableContainerProps) => {
	const { setNodeRef, isOver } = useDroppable({ id })
	const highlighted = isOver || isHighlighted

	return (
		<div ref={setNodeRef} className={`${className || ''} ${highlighted ? classes.containerIsOver : ''}`}>
			{children}
		</div>
	)
}
