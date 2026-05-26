'use client'

import { OwnerAvatar } from '@/app/(main)/projects/components/main/projects-list/project-card/components/owner-avatar/owner-avatar'
import { useEnrichedTeamMembers } from '@/shared/hooks/projects/kanban-board/use-enriched-team-members'
import {
	autoUpdate,
	flip,
	FloatingPortal,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from '@floating-ui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './assignee-select.module.scss'

interface AssigneeSelectProps {
	teamId?: string | null
	currentAssigneeId?: string
	currentAssigneeName?: string
	onAssigneeChange: (userId: string, userName: string) => void
}

export const AssigneeSelect = ({
	teamId,
	currentAssigneeId,
	currentAssigneeName,
	onAssigneeChange,
}: AssigneeSelectProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const { teammates, isLoading } = useEnrichedTeamMembers(teamId || '')

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-start',
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip(), shift()],
	})

	const click = useClick(context, { enabled: !!teamId })
	const dismiss = useDismiss(context)
	const role = useRole(context, { role: 'listbox' })

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

	const handleSelect = (userId: string, userName: string) => {
		onAssigneeChange(userId, userName)
		setIsOpen(false)
	}

	return (
		<div className={classes.assigneeSelectContainer}>
			<button
				ref={refs.setReference}
				className={clsx(classes.triggerButton, !teamId && classes.disabled)}
				{...getReferenceProps()}
				type='button'
			>
				<OwnerAvatar userId={currentAssigneeId || ''} size={24} />
				<span>{currentAssigneeName || 'Unassigned'}</span>
			</button>

			{isOpen && teamId && (
				<FloatingPortal>
					<div ref={refs.setFloating} style={floatingStyles} className={classes.dropdown} {...getFloatingProps()}>
						<div className={classes.dropdownTitle}>Assign task to</div>

						{isLoading ? (
							<div className={classes.loaderWrapper}>
								<BeatLoader color='#aaa' size={6} />
							</div>
						) : (
							<ul className={classes.membersList}>
								{teammates.map(member => (
									<li
										key={member.$id}
										className={classes.memberOption}
										onClick={() => handleSelect(member.userId, member.userName)}
									>
										<OwnerAvatar userId={member.userId} size={28} />
										<div className={classes.memberText}>
											<span className={classes.name}>{member.userName}</span>
											{member.userEmail && <span className={classes.email}>{member.userEmail}</span>}
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</FloatingPortal>
			)}
		</div>
	)
}
