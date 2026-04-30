'use client'

import { GiftIcon } from '../icons/welcome/gift-icon'
import { MailIcon } from '../icons/welcome/mail-icon'
import { RocketIcon } from '../icons/welcome/rocket-icon'
import classes from './beta-welcome-content.module.scss'

interface BetaWelcomeContentProps {
	onConfirm: () => void
}

export const BetaWelcomeContent = ({ onConfirm }: BetaWelcomeContentProps) => {
	return (
		<div className={classes.container}>
			<div className={classes.iconHeader}>
				<RocketIcon className={classes.rocketIcon} />
			</div>
			<h2 className={classes.title}>Welcome to Focusphere Beta!</h2>
			<p className={classes.description}>
				You are one of the very first users to join our ecosystem. Focusphere is currently in
				<strong> active beta</strong>, so the entire platform is 100% free to use while we build and polish the
				experience.
			</p>
			<div className={classes.features}>
				<div className={classes.feature}>
					<GiftIcon className={classes.featureIcon} />
					<span>Unlimited access to all features</span>
				</div>
				<div className={classes.feature}>
					<MailIcon className={classes.featureIcon} />
					<span>Direct line to the developer</span>
				</div>
			</div>
			<div className={classes.feedbackCard}>
				<span className={classes.cardLabel}>Found a bug or have an idea?</span>
				<a href='mailto:lisnyak.nikita@gmail.com?subject=Focusphere Feedback' className={classes.emailLink}>
					lisnyak.nikita@gmail.com
				</a>
			</div>
			<p className={classes.settingsHint}>
				You can always find these contact options later in your <strong>Settings</strong>.
			</p>
			<button className={classes.actionButton} onClick={onConfirm}>
				Let&apos;s get started!
			</button>
		</div>
	)
}
