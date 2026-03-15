'use client'

import { useInviteMembers } from '@/shared/hooks/projects/invitation/use-invite-members'
import classes from './project-members-settings.module.scss'

interface ProjectMembersSettingsProps {
	projectId: string
	teamId: string
}

export const ProjectMembersSettings = ({ projectId, teamId }: ProjectMembersSettingsProps) => {
	const { inputValue, setInputValue, members, isSending, formatEmail, addMember, removeMember, sendInvites } =
		useInviteMembers(teamId, projectId)

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addMember()
		}
	}

	return (
		<div className={classes.teamInvitationForm}>
			<h3 className={classes.formTitle}>Bring the team with you</h3>
			<div className={classes.titleLabel}>
				<span>Enter names or emails</span>
				<div className={classes.inputWrapper}>
					<input
						type='text'
						placeholder='John Smith'
						value={inputValue}
						onChange={e => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<div className={classes.suggestion}>
						{inputValue && (
							<svg
								className={classes.icon}
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								width='16'
								height='16'
							>
								<path
									d='M19,1H5A5.006,5.006,0,0,0,0,6V18a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V6A5.006,5.006,0,0,0,19,1ZM5,3H19a3,3,0,0,1,2.78,1.887l-7.658,7.659a3.007,3.007,0,0,1-4.244,0L2.22,4.887A3,3,0,0,1,5,3ZM19,21H5a3,3,0,0,1-3-3V7.5L8.464,13.96a5.007,5.007,0,0,0,7.072,0L22,7.5V18A3,3,0,0,1,19,21Z'
									fill='var(--text)'
								/>
							</svg>
						)}
						<div className={classes.emailBlock}>{!inputValue ? 'Enter an email address' : formatEmail(inputValue)}</div>
					</div>
					{members.length > 0 && (
						<div className={classes.membersList}>
							{members.map((member, i) => (
								<div key={i} className={classes.membersItem}>
									{member}
									<button type='button' className={classes.removeBtn} onClick={() => removeMember(i)}>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<div className={classes.buttons}>
				<button
					className={classes.continueButton}
					type='button'
					onClick={sendInvites}
					disabled={isSending || (members.length === 0 && !inputValue)}
				>
					{isSending ? 'Sending...' : members.length > 1 ? 'Send Invitations' : 'Send Invitation'}
				</button>
			</div>
		</div>
	)
}
