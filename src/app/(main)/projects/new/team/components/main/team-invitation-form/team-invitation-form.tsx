'use client'

import { useTeamInvitation } from '@/shared/hooks/projects/use-team-invitation'
import { TeamInvitationValues, teamInvitationSchema } from '@/shared/schemas/team-invitation-schema'
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

		if (generatedEmail && isValidEmail(generatedEmail) && !isDuplicate) {
			append({ email: generatedEmail })
			setValue('currentInput', '')
		}
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
		<form className={classes.teamInvitationForm} onSubmit={handleSubmit(data => onSubmit(data, currentInput))}>
			<h3 className={classes.formTitle}>Bring the team with you</h3>
			<p className={classes.formSubtitle}>Invite these teammates to your project and work together</p>
			<div className={classes.titleLabel}>
				<span>Enter names or emails</span>
				<div className={classes.inputWrapper}>
					<input type='text' placeholder='John Smith' {...register('currentInput')} onKeyDown={handleKeyDown} />
					<div className={classes.suggestion}>
						{currentInput && <SuggestionIcon className={classes.icon} />}
						<span className={classes.emailBlock}>{currentInput ? generatedEmail : 'Enter an email address'}</span>
					</div>
					{fields.length > 0 && (
						<ul className={classes.membersList}>
							{fields.map((field, i) => (
								<li key={field.id} className={classes.membersItem}>
									{field.email}
									<button
										type='button'
										className={classes.removeBtn}
										onClick={() => remove(i)}
										aria-label={`Remove ${field.email}`}
									>
										×
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
			{submitError && <p className={classes.errorMessage}>{submitError}</p>}
			<div className={classes.buttons}>
				<button type='button' className={classes.skipButton} onClick={redirectToBoard}>
					Skip
				</button>
				<button className={classes.continueButton} type='submit' disabled={isSubmitting || !teamId}>
					{isSubmitting ? 'Sending...' : 'Invite and continue'}
				</button>
			</div>
		</form>
	)
}
