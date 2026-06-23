'use client'

import { useEmailTags } from '@/shared/hooks/projects/use-email-tags'
import { useTeamInvitation } from '@/shared/hooks/projects/use-team-invitation'
import { SuggestionIcon } from '@/shared/ui/icons/projects/suggestion-icon'
import { useRouter, useSearchParams } from 'next/navigation'
import classes from './team-invitation-form.module.scss'

export const TeamInvitationForm = () => {
	const searchParams = useSearchParams()
	const projectId = searchParams.get('projectId')
	const router = useRouter()

	const { name, setName, members, handleKeyDown, removeMember, getFinalEmails, suggestionEmail } = useEmailTags()

	const { teamId, isSending, sendInvitations } = useTeamInvitation(projectId)

	const handleRedirectToBoard = () => {
		router.push(`/projects/${projectId}/board`)
	}

	const handleInviteAndContinue = async (e: React.FormEvent) => {
		e.preventDefault()

		const finalEmails = getFinalEmails()

		if (finalEmails.length === 0) {
			handleRedirectToBoard()
			return
		}

		try {
			await sendInvitations(finalEmails)
			handleRedirectToBoard()
		} catch (err) {
			console.error('Failed to process invitations:', err)
		}
	}

	return (
		<form className={classes.teamInvitationForm} onSubmit={handleInviteAndContinue}>
			<h3 className={classes.formTitle}>Bring the team with you</h3>
			<p className={classes.formSubtitle}>Invite these teammates to your project and work together</p>
			<div className={classes.titleLabel}>
				<span>Enter names or emails</span>
				<div className={classes.inputWrapper}>
					<input
						type='text'
						placeholder='John Smith'
						value={name}
						onChange={e => setName(e.target.value)}
						onKeyDown={handleKeyDown}
						autoFocus
					/>
					<div className={classes.suggestion}>
						{name && <SuggestionIcon className={classes.icon} />}
						<div className={classes.emailBlock}>{!name ? 'Enter an email address' : suggestionEmail}</div>
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
				<button type='button' className={classes.skipButton} onClick={handleRedirectToBoard} disabled={isSending}>
					Skip
				</button>
				<button className={classes.continueButton} type='submit' disabled={isSending || !teamId}>
					{isSending ? 'Sending...' : 'Invite and continue'}
				</button>
			</div>
		</form>
	)
}
