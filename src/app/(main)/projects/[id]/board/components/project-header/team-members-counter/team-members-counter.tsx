'use client'

import { OwnerAvatar } from '@/app/(main)/projects/components/main/projects-list/project-card/components/owner-avatar/owner-avatar'
import { removeTeamMember } from '@/app/actions/remove-team-member'
import { useEnrichedTeamMembers } from '@/shared/hooks/projects/kanban-board/use-enriched-team-members'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { TeamMember } from '@/shared/types/chat'
import { ConfirmModal } from '@/shared/ui/confirm-modal/confirm-modal'
import { CloseIcon } from '@/shared/ui/icons/close-icon'
import { MembersIcon } from '@/shared/ui/icons/projects/members-icon'
import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'sonner'
import classes from './team-members-counter.module.scss'

interface TeamMembersCounterProps {
	teamId?: string
	projectType: 'solo' | 'team'
	ownerId?: string
}

export const TeamMembersCounter = ({ teamId, projectType, ownerId }: TeamMembersCounterProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
	const [isRemoving, setIsRemoving] = useState(false)

	const { user } = useUser()
	const queryClient = useQueryClient()

	const isSolo = projectType === 'solo'
	const isOwner = !!(user?.$id && ownerId && user.$id === ownerId)

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

	const safeMembersCount = Array.isArray(teammates) ? teammates.length : 0
	const displayCount = isSolo ? 1 : safeMembersCount

	const handleConfirmRemove = async () => {
		if (!teamId || !memberToDelete) return

		try {
			setIsRemoving(true)
			await removeTeamMember(teamId, memberToDelete.$id)
			toast.success(`Member ${memberToDelete.userName} removed from project`)
			queryClient.invalidateQueries({ queryKey: ['team-members', teamId] })
			queryClient.invalidateQueries({ queryKey: ['team-memberships', teamId] })
		} catch (error) {
			console.error('Failed to remove team member:', error)
			toast.error('Failed to remove member')
		} finally {
			setIsRemoving(false)
			setMemberToDelete(null)
		}
	}

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
									{isOwner && member.userId !== ownerId && (
										<button
											type='button'
											className={classes.removeButton}
											title='Remove member'
											onClick={e => {
												e.stopPropagation()
												setMemberToDelete(member)
											}}
										>
											<CloseIcon width={14} height={14} />
										</button>
									)}
								</li>
							))}
							{teammates.length === 0 && <div className={classes.emptyState}>No members found</div>}
						</ul>
					)}
				</div>
			)}

			<ConfirmModal
				isVisible={!!memberToDelete}
				title='Remove Member'
				message={`Are you sure you want to remove ${memberToDelete?.userName || 'this user'} from the project?`}
				confirmText={isRemoving ? 'Removing...' : 'Remove'}
				cancelText='Cancel'
				onConfirm={handleConfirmRemove}
				onClose={() => setMemberToDelete(null)}
			/>
		</>
	)
}
