'use client'

import { useAvatarUrl } from '@/shared/hooks/avatar-url/use-avatar-url'
import { useThemeToggle } from '@/shared/hooks/use-theme-toggle/use-theme-toggle'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { SignOutIcon } from '@/shared/ui/icons/sign-out-icon'
import { Modal } from '@/shared/ui/modal/modal'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
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
	const [isSettingsTooltipOpen, setIsSettingsTooltipOpen] = useState(false)
	const [isSignOutTooltipOpen, setIsSignOutTooltipOpen] = useState(false)
	const { user, logout, updateUserData } = useUser()

	const { avatarUrl, setAvatarUrl } = useAvatarUrl(user)

	const { isDark, handleToggle } = useThemeToggle()

	const { refs: settingsRefs, floatingStyles: settingsFloatingStyles } = useFloating({
		open: isSettingsTooltipOpen,
		onOpenChange: setIsSettingsTooltipOpen,
		middleware: [offset(10), flip(), shift()],
		whileElementsMounted: autoUpdate,
		placement: 'right',
	})

	const { refs: signOutRefs, floatingStyles: signOutFloatingStyles } = useFloating({
		open: isSignOutTooltipOpen,
		onOpenChange: setIsSignOutTooltipOpen,
		middleware: [offset(10), flip(), shift()],
		whileElementsMounted: autoUpdate,
		placement: 'right',
	})

	const handleNameUpdate = (newName: string) => {
		if (!user) return

		updateUserData({ name: newName })
	}

	const getDisplayName = () => {
		if (!user) return 'Guest'
		return user.name || user.email.split('@')[0]
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
					<Image src={avatarUrl} alt='Avatar' width={60} height={60} objectFit='cover' style={{ borderRadius: 5 }} />
				) : (
					<Image
						src='/avatar.jpg'
						alt='Default avatar'
						width={60}
						height={60}
						objectFit='cover'
						style={{ borderRadius: 5 }}
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
					<h6 className={classes.modalTitle}>Settings</h6>
					<div className={classes.themeSwitcher}>
						<span>Dark mode</span>
						<div className={clsx(classes.toggle, isDark && classes.active)} onClick={handleToggle}></div>
					</div>
					<div className={classes.userInfo}>
						<AvatarUploader avatarUrl={avatarUrl} onUploaded={setAvatarUrl} />
						<EditableUsername displayName={getDisplayName()} onNameUpdated={handleNameUpdate} />
					</div>
					<a type='email' href={`mailto:${user?.email || 'null'}`} className={classes.userEmail}>
						{user?.email || 'null'}
					</a>
					<button className={classes.saveButton} onClick={() => setIsVisible(false)}>
						Save
					</button>
					<button
						className={classes.signOutButton}
						ref={signOutRefs.setReference}
						onClick={logout}
						onMouseEnter={() => isCollapsed && setIsSignOutTooltipOpen(true)}
						onMouseLeave={() => setIsSignOutTooltipOpen(false)}
					>
						<SignOutIcon />
						{isSignOutTooltipOpen && isCollapsed && (
							<div
								ref={signOutRefs.setFloating}
								style={{
									...signOutFloatingStyles,
									background: 'var(--save-button-bg)',
									color: 'var(--save-button-text)',
									padding: '4px 8px',
									borderRadius: '5px',
									fontSize: '14px',
									fontWeight: 700,
									whiteSpace: 'nowrap',
									zIndex: 1000,
								}}
								role='tooltip'
							>
								Sign Out
							</div>
						)}
					</button>
				</div>
			</Modal>
		</>
	)
}
