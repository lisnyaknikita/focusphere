'use client'

import { useTeamInvitation } from '@/shared/hooks/projects/use-team-invitation'
import { TeamInvitationValues, teamInvitationSchema } from '@/shared/schemas/team-invitation-schema'
import { SuggestionIcon } from '@/shared/ui/icons/projects/suggestion-icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import classes from './team-invitation-form.module.scss'

export const TeamInvitationForm = () => {
	const { teamId, fetchError, submitError, generateEmail, isValidEmail, redirectToBoard, onSubmit } =
		useTeamInvitation()

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { isSubmitting },
	} = useForm<TeamInvitationValues>({
		defaultValues: { members: [], currentInput: '' },
		resolver: zodResolver(teamInvitationSchema),
	})

	const { fields, append, remove } = useFieldArray({ control, name: 'members' })

	const currentInput = watch('currentInput') ?? ''
	const generatedEmail = generateEmail(currentInput)

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return
		e.preventDefault()

		const isDuplicate = fields.some(f => f.email === generatedEmail)

		if (generatedEmail && isValidEmail(generatedEmail) && !isDuplicate) {
			append({ email: generatedEmail })
			setValue('currentInput', '')
		}
	}

	if (fetchError) {
		return (
			<div className={classes.teamInvitationForm}>
				<p className={classes.errorMessage}>{fetchError}</p>
			</div>
		)
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
