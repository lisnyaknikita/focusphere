'use client'

import { account } from '@/lib/appwrite'
import { APP_URL } from '@/shared/constants/app'
import { useAvatarUrl } from '@/shared/hooks/avatar-url/use-avatar-url'
import { useThemeToggle } from '@/shared/hooks/use-theme-toggle/use-theme-toggle'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { useTimeBlockUIStore } from '@/shared/stores/time-block-ui-store'
import { FeedbackModal } from '@/shared/ui/feedback-section/feedback-modal/feedback-modal'
import { FeedbackSection } from '@/shared/ui/feedback-section/feedback-section'
import { SignOutIcon } from '@/shared/ui/icons/sign-out-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import { OAuthProvider } from 'appwrite'
import clsx from 'clsx'
import Image from 'next/image'
import { useState } from 'react'
import { AvatarUploader } from './avatar-uploader/avatar-uploader'
import { EditableUsername } from './editable-username/editable-username'
import classes from './user-button.module.scss'

interface UserButtonProps {
	isCollapsed: boolean
}

export const UserButton = ({ isCollapsed }: UserButtonProps) => {
	const [isVisible, setIsVisible] = useState(false)
	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
	const [isSettingsTooltipOpen, setIsSettingsTooltipOpen] = useState(false)
	const { user, logout, updateUserData, isGoogleConnected } = useUser()
	const { isEnabled, setEnabled } = useTimeBlockUIStore()

	const { avatarUrl, setAvatarUrl } = useAvatarUrl(user)

	const { isDark, handleToggle } = useThemeToggle()

	const { refs: settingsRefs, floatingStyles: settingsFloatingStyles } = useFloating({
		open: isSettingsTooltipOpen,
		onOpenChange: setIsSettingsTooltipOpen,
		middleware: [offset(10), flip(), shift()],
		whileElementsMounted: autoUpdate,
		placement: 'right',
	})

	const getDisplayName = () => {
		if (!user) return 'Guest'
		return user.name || user.email.split('@')[0]
	}

	const handleConnectGoogle = () => {
		account.createOAuth2Session(OAuthProvider.Google, `${APP_URL}/dashboard`, `${APP_URL}/dashboard`, [
			'https://www.googleapis.com/auth/calendar',
		])
	}

	return (
		<>
			<button
				className={clsx(classes.userButton, isCollapsed && 'collapsed')}
				onClick={() => setIsVisible(true)}
				ref={settingsRefs.setReference}
				onMouseEnter={() => isCollapsed && setIsSettingsTooltipOpen(true)}
				onMouseLeave={() => setIsSettingsTooltipOpen(false)}
			>
				{avatarUrl ? (
					<Image
						src={avatarUrl}
						alt='Avatar'
						width={60}
						height={60}
						objectFit='cover'
						style={{ borderRadius: 5, objectFit: 'cover' }}
					/>
				) : (
					<Image
						src='/avatar.jpg'
						alt='Default avatar'
						width={60}
						height={60}
						objectFit='cover'
						style={{ borderRadius: 5, objectFit: 'cover' }}
					/>
				)}
				{isSettingsTooltipOpen && isCollapsed && (
					<div
						ref={settingsRefs.setFloating}
						style={{
							...settingsFloatingStyles,
							background: 'var(--save-button-bg)',
							color: 'var(--save-button-text)',
							padding: '4px 8px',
							borderRadius: '5px',
							fontSize: '14px',
							fontWeight: 700,
							zIndex: 1000,
						}}
						role='tooltip'
					>
						Settings
					</div>
				)}
			</button>
			<Modal isVisible={isVisible} onClose={() => setIsVisible(false)}>
				<div className={classes.modalInner}>
					<div className={classes.modalHeader}>
						<h6 className={classes.modalTitle}>Settings</h6>
						<button className={classes.closeX} onClick={() => setIsVisible(false)}>
							✕
						</button>
					</div>
					<div className={classes.modalContent}>
						<section className={classes.section}>
							<div className={classes.profileRow}>
								<AvatarUploader avatarUrl={avatarUrl} onUploaded={setAvatarUrl} />
								<div className={classes.profileInfo}>
									<EditableUsername displayName={getDisplayName()} onNameUpdated={name => updateUserData({ name })} />
									<span className={classes.emailHint}>{user?.email}</span>
								</div>
							</div>
						</section>
						<hr className={classes.divider} />
						<section className={classes.section}>
							<span className={classes.sectionLabel}>APPEARANCE</span>
							<div className={classes.settingsStack}>
								<div className={classes.settingsCard}>
									<span>Dark mode</span>
									<div className={clsx(classes.toggle, isDark && classes.active)} onClick={handleToggle}></div>
								</div>
								<div className={classes.settingsCard}>
									<span>Time block bar</span>
									<div
										className={clsx(classes.toggle, isEnabled && classes.active)}
										onClick={() => setEnabled(!isEnabled)}
									></div>
								</div>
							</div>
						</section>
						{!isGoogleConnected && (
							<>
								<hr className={classes.divider} />
								<section className={classes.section}>
									<span className={classes.sectionLabel}>CONNECTIONS</span>
									<div className={classes.settingsCard}>
										<span>Google Calendar</span>
										<button className={classes.connectBtn} onClick={handleConnectGoogle}>
											Connect
										</button>
									</div>
								</section>
							</>
						)}
						<hr className={classes.divider} />
						<section className={classes.section}>
							<span className={classes.sectionLabel}>SUPPORT</span>
							<FeedbackSection onOpenModal={() => setIsFeedbackOpen(true)} />
						</section>
					</div>
					<div className={classes.modalFooter}>
						<button className={classes.mainSaveButton} onClick={() => setIsVisible(false)}>
							Save changes
						</button>
						<button className={classes.footerLogout} onClick={logout} title='Sign Out'>
							<SignOutIcon />
						</button>
					</div>
				</div>
			</Modal>
			<FeedbackModal isVisible={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
		</>
	)
}
