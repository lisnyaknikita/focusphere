'use client'

import { useInviteMembers } from '@/shared/hooks/projects/invitation/use-invite-members'
import { SuggestionIcon } from '@/shared/ui/icons/projects/suggestion-icon'
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
						{inputValue && <SuggestionIcon />}
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
