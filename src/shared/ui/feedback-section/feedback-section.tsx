'use client'

import { ArrowTopIcon } from '../icons/calendar/arrow-top-icon'
import { MailIcon } from '../icons/welcome/mail-icon'
import classes from './feedback-section.module.scss'

interface FeedbackSectionProps {
	onOpenModal: () => void
}

export const FeedbackSection = ({ onOpenModal }: FeedbackSectionProps) => {
	return (
		<button className={classes.feedbackTrigger} onClick={onOpenModal} type='button'>
			<div className={classes.triggerLeft}>
				<span className={classes.icon}>
					<MailIcon />
				</span>
				<span className={classes.label}>Feedback & Support</span>
			</div>
			<span className={classes.arrow}>
				<ArrowTopIcon style={{ rotate: '90deg' }} />
			</span>
		</button>
	)
}
