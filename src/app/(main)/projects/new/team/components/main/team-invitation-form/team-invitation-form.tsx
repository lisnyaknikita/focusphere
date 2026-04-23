'use client'

import { inviteMembersToTeam } from '@/lib/projects/invite-service/invite-service'
import { getProjectById } from '@/lib/projects/projects'
import { SuggestionIcon } from '@/shared/ui/icons/projects/suggestion-icon'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import classes from './team-invitation-form.module.scss'

export const TeamInvitationForm = () => {
	const searchParams = useSearchParams()
	const projectId = searchParams.get('projectId')
	const router = useRouter()

	const [name, setName] = useState('')
	const [members, setMembers] = useState<string[]>([])
	const [teamId, setTeamId] = useState<string | null>(null)

	const { mutate: sendInvites, isPending: isSending } = useMutation({
		mutationFn: ({ teamId, emails }: { teamId: string; emails: string[] }) =>
			inviteMembersToTeam(teamId, emails, projectId!),
		onSuccess: () => router.push(`/projects/${projectId}/board`),
		onError: err => toast.error(err instanceof Error ? err.message : 'Invitation failed'),
	})

	const generateEmail = (input: string) => {
		const cleaned = input.trim().toLowerCase()
		if (!cleaned) return ''
		if (cleaned.includes('@')) return cleaned
		return cleaned.replace(/\s+/g, '') + '@gmail.com'
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			const email = generateEmail(name)

			if (email && email.includes('.') && !members.includes(email)) {
				setMembers(prev => [...prev, email])
				setName('')
			}
		}
	}

	const removeMember = (index: number) => {
		setMembers(prev => prev.filter((_, i) => i !== index))
	}

	useEffect(() => {
		if (projectId) {
			getProjectById(projectId).then(project => {
				if (project.teamId) setTeamId(project.teamId)
			})
		}
	}, [projectId])

	const handleInviteAndContinue = (e: React.FormEvent) => {
		e.preventDefault()

		const currentEmail = generateEmail(name)
		let finalEmails = [...members]
		if (currentEmail && !finalEmails.includes(currentEmail)) {
			finalEmails.push(currentEmail)
		}
		finalEmails = finalEmails.map(m => m.trim()).filter(m => m.length > 0)

		if (finalEmails.length === 0) {
			router.push(`/projects/${projectId}/board`)
			return
		}

		if (!teamId) return

		const invitePromise = new Promise<void>((resolve, reject) => {
			sendInvites(
				{ teamId, emails: finalEmails },
				{
					onSuccess: () => resolve(),
					onError: reject,
				}
			)
		})

		toast.promise(invitePromise, {
			loading: 'Sending invitations...',
			success: 'Invitations sent!',
			error: () => '',
		})
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
						<div className={classes.emailBlock}>{!name ? 'Enter an email address' : generateEmail(name)}</div>
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
				<button className={classes.skipButton} onClick={() => router.push(`/projects/${projectId}/board`)}>
					Skip
				</button>
				<button className={classes.continueButton} type='submit' disabled={isSending || !teamId}>
					{isSending ? 'Sending...' : 'Invite and continue'}
				</button>
			</div>
		</form>
	)
}
