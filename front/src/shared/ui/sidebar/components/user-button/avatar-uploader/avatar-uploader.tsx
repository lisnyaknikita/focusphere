'use client'

import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import classes from './avatar-uploader.module.scss'

export const AvatarUploader = () => {
	const [avatar, setAvatar] = useState<string | null>(null)
	const [isAvatarUploaderTooltipOpen, setIsAvatarUploaderTooltipOpen] = useState(false)

	const inputRef = useRef<HTMLInputElement | null>(null)

	const { refs: avatarUploaderRefs, floatingStyles: avatarUploaderFloatingStyles } = useFloating({
		open: isAvatarUploaderTooltipOpen,
		onOpenChange: setIsAvatarUploaderTooltipOpen,
		middleware: [offset(5), flip(), shift()],
		whileElementsMounted: autoUpdate,
		placement: 'right',
	})

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatar(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const triggerFileInput = () => {
		inputRef.current?.click()
	}

	return (
		<div
			className={classes.wrapper}
			ref={avatarUploaderRefs.setReference}
			onMouseEnter={() => setIsAvatarUploaderTooltipOpen(true)}
			onMouseLeave={() => setIsAvatarUploaderTooltipOpen(false)}
		>
			{isAvatarUploaderTooltipOpen && (
				<div
					ref={avatarUploaderRefs.setFloating}
					style={{
						...avatarUploaderFloatingStyles,
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
					Edit
				</div>
			)}
			<div className={classes.avatar} onClick={triggerFileInput}>
				{avatar ? (
					<Image src={avatar} alt='Avatar' fill />
				) : (
					<svg viewBox='0 0 18 24' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='m18 24h-2v-5.0431c-8e-4 -0.784-0.3126-1.5356-0.867-2.09-0.5543-0.5544-1.306-0.8662-2.09-0.867h-8.086c-0.784 8e-4 -1.5357 0.3126-2.09 0.867-0.55437 0.5544-0.86617 1.306-0.86696 2.09v5.0431h-2v-5.0431c0.0015878-1.3142 0.52435-2.5741 1.4536-3.5033 0.92927-0.9293 2.1892-1.4521 3.5034-1.4537h8.086c1.3142 0.0016 2.5741 0.5244 3.5034 1.4537 0.9292 0.9292 1.452 2.1891 1.4536 3.5033v5.0431z'
							fill='#1C1B1B'
						/>
						<path
							d='m9 12c-1.1867 0-2.3467-0.3519-3.3334-1.0112-0.98669-0.6592-1.7557-1.5963-2.2098-2.6927-0.45413-1.0964-0.57295-2.3028-0.34144-3.4666s0.80296-2.233 1.6421-3.0721c0.83912-0.83912 1.9082-1.4106 3.0721-1.6421s2.3702-0.11269 3.4666 0.34144c1.0964 0.45413 2.0334 1.2232 2.6927 2.2099 0.6593 0.98669 1.0112 2.1467 1.0112 3.3334-0.0016 1.5908-0.6342 3.116-1.7591 4.2409-1.1249 1.1249-2.6501 1.7575-4.2409 1.7591zm0-10c-0.79112 0-1.5645 0.23459-2.2223 0.67412-0.65779 0.43953-1.1705 1.0642-1.4732 1.7952s-0.38196 1.5352-0.22762 2.3111 0.53531 1.4887 1.0947 2.0481 1.2721 0.94038 2.0481 1.0947c0.77593 0.15433 1.5802 0.07513 2.3111-0.22763 0.7309-0.30275 1.3557-0.81544 1.7952-1.4732s0.6741-1.4312 0.6741-2.2223c0-1.0609-0.4214-2.0783-1.1716-2.8284-0.7501-0.75014-1.7675-1.1716-2.8284-1.1716z'
							fill='#1C1B1B'
						/>
					</svg>
				)}
				<input type='file' accept='image/*' onChange={handleImageChange} ref={inputRef} hidden />
			</div>
		</div>
	)
}
