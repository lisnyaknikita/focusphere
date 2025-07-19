'use client'

import { Modal } from '@/shared/ui/modal/modal'
import clsx from 'clsx'
import { useState } from 'react'
import { AvatarUploader } from './avatar-uploader/avatar-uploader'
import { EditableUsername } from './editable-username/editable-username'
import classes from './user-button.module.scss'

interface UserButtonProps {
	isCollapsed: boolean
}

export const UserButton = ({ isCollapsed }: UserButtonProps) => {
	const [isVisible, setIsVisible] = useState(false)
	const [isToggled, setIsToggled] = useState(true)

	return (
		<>
			<button className={clsx(classes.userButton, isCollapsed && 'collapsed')} onClick={() => setIsVisible(true)}>
				N
			</button>

			<Modal isVisible={isVisible} onClose={() => setIsVisible(false)}>
				<div className={classes.modalInner}>
					<h6 className={classes.modalTitle}>Settings</h6>
					<div className={classes.themeSwitcher}>
						<span>Dark mode</span>
						<div
							className={clsx(classes.toggle, isToggled && classes.active)}
							onClick={() => setIsToggled(prev => !prev)}
						></div>
					</div>
					<div className={classes.userInfo}>
						<AvatarUploader />
						<EditableUsername />
					</div>
					<a type='email' href='mailto:example@gmail.com' className={classes.userEmail}>
						example@gmail.com
					</a>
					<button className={classes.saveButton}>Save</button>
					<button className={classes.closeButton}>
						<svg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
							<circle cx='10' cy='10' r='10' fill='#262525' />
							<path
								d='m14.568 8.8214-1.4358-1.6161c-0.0698-0.07589-0.1633-0.11789-0.2604-0.11694-0.097 9.5e-4 -0.1898 0.04477-0.2585 0.12202-0.0686 0.07725-0.1075 0.18174-0.1084 0.29099-8e-4 0.10924 0.0365 0.21448 0.1039 0.29306l1.4358 1.6161c0.0427 0.04897 0.0799 0.10352 0.1111 0.16249-0.0056 0-0.01-0.00333-0.0156-0.00333l-5.8053 0.01333c-0.09817 0-0.19232 0.04389-0.26173 0.12203-0.06942 0.07813-0.10842 0.18411-0.10842 0.29461 0 0.11053 0.039 0.21643 0.10842 0.29463 0.06941 0.0781 0.16356 0.122 0.26173 0.122l5.8031-0.0133c0.0103 0 0.0189-0.0059 0.0289-0.0067-0.0329 0.0705-0.0745 0.1353-0.1237 0.1925l-1.4358 1.6161c-0.0353 0.0385-0.0635 0.0844-0.0829 0.1353-0.0194 0.0508-0.0296 0.1055-0.03 0.1608-5e-4 0.0553 0.0089 0.1102 0.0275 0.1614s0.0461 0.0977 0.0809 0.1368c0.0347 0.0391 0.076 0.0701 0.1215 0.091 0.0455 0.021 0.0943 0.0315 0.1434 0.031 0.0492-4e-4 0.0977-0.0119 0.1429-0.0338 0.0451-0.0218 0.086-0.0535 0.1201-0.0933l1.4358-1.6162c0.2776-0.3125 0.4335-0.7363 0.4335-1.1782 0-0.44191-0.1559-0.86573-0.4335-1.1783h0.0015z'
								fill='#fff'
								fillOpacity='.82'
							/>
							<path
								d='m7.591 14.166h-0.74029c-0.2945 0-0.57694-0.1316-0.78519-0.366-0.20824-0.2345-0.32523-0.5524-0.32523-0.8839v-5.8329c0-0.3315 0.11699-0.64942 0.32523-0.88382 0.20825-0.23441 0.49069-0.36609 0.78519-0.36609h0.74029c0.09817 0 0.19231-0.0439 0.26173-0.12203 0.06942-0.07814 0.10841-0.18411 0.10841-0.29461s-0.03899-0.21647-0.10841-0.29461c-0.06942-0.07813-0.16356-0.12203-0.26173-0.12203h-0.74029c-0.49066 6.6e-4 -0.96105 0.22035-1.308 0.61088s-0.54212 0.92002-0.54271 1.4723v5.8329c5.9e-4 0.5523 0.19576 1.0818 0.54271 1.4723 0.34695 0.3906 0.81734 0.6103 1.308 0.6109h0.74029c0.09817 0 0.19231-0.0439 0.26173-0.122s0.10841-0.1841 0.10841-0.2946-0.03899-0.2165-0.10841-0.2946c-0.06942-0.0782-0.16356-0.1221-0.26173-0.1221z'
								fill='#fff'
								fillOpacity='.82'
							/>
						</svg>
					</button>
				</div>
			</Modal>
		</>
	)
}
