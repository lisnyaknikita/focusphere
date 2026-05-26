'use client'

import { OwnerAvatar } from '@/app/(main)/projects/components/main/projects-list/project-card/components/owner-avatar/owner-avatar'
import { useEnrichedTeamMembers } from '@/shared/hooks/projects/kanban-board/use-enriched-team-members'
import { MembersIcon } from '@/shared/ui/icons/projects/members-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './team-members-counter.module.scss'

interface TeamMembersCounterProps {
	teamId?: string
	projectType: 'solo' | 'team'
}

export const TeamMembersCounter = ({ teamId, projectType }: TeamMembersCounterProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const isSolo = projectType === 'solo'

	const { teammates, isLoading } = useEnrichedTeamMembers(isSolo ? undefined : teamId)

	const { refs, floatingStyles, context } = useFloating({
		open: isSolo ? false : isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-start',
		whileElementsMounted: autoUpdate,
		middleware: [offset(10), flip(), shift()],
	})

	const hover = useHover(context, {
		delay: { open: 200, close: 150 },
		handleClose: null,
		enabled: !isSolo,
	})

	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	const displayCount = projectType === 'solo' ? 1 : teammates.length

	return (
		<>
			<div
				ref={refs.setReference}
				className={clsx(classes.counterTrigger, isSolo && classes.isSolo)}
				{...getReferenceProps()}
			>
				<MembersIcon />
				<span>
					{displayCount} {displayCount === 1 ? 'team member' : 'team members'}
				</span>
			</div>

			{!isSolo && (
				<div
					ref={refs.setFloating}
					style={floatingStyles}
					className={clsx(classes.popover, isOpen && classes.popoverVisible)}
					{...getFloatingProps()}
				>
					<h6 className={classes.popoverTitle}>Project Members</h6>
					{isLoading ? (
						<div className={classes.loaderWrapper}>
							<BeatLoader color='#aaa' size={10} />
						</div>
					) : (
						<ul className={classes.membersList}>
							{teammates.map(member => (
								<li key={member.$id} className={classes.memberItem}>
									<div className={classes.avatarWrapper}>
										<OwnerAvatar userId={member.userId} size={32} />
									</div>
									<div className={classes.memberInfo}>
										<span className={classes.name}>{member.userName}</span>
										{member.userEmail && <span className={classes.email}>{member.userEmail}</span>}
									</div>
								</li>
							))}
							{teammates.length === 0 && <div className={classes.emptyState}>No members found</div>}
						</ul>
					)}
				</div>
			)}
		</>
	)
}
