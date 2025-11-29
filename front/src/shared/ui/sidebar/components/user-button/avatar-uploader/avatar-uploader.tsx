'use client'

import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import classes from './avatar-uploader.module.scss'
import { uploadNewAvatar } from './services/upload-avatar-service/upload-avatar-service'

interface AvatarUploaderProps {
	avatarUrl: string | null
	onUploaded: (newUrl: string) => void
}

export const AvatarUploader = ({ avatarUrl, onUploaded }: AvatarUploaderProps) => {
	const [localUrl, setLocalUrl] = useState<string | null>(avatarUrl)
	const [isAvatarUploaderTooltipOpen, setIsAvatarUploaderTooltipOpen] = useState(false)

	const inputRef = useRef<HTMLInputElement | null>(null)

	const { refs: avatarUploaderRefs, floatingStyles: avatarUploaderFloatingStyles } = useFloating({
		open: isAvatarUploaderTooltipOpen,
		onOpenChange: setIsAvatarUploaderTooltipOpen,
		middleware: [offset(5), flip(), shift()],
		whileElementsMounted: autoUpdate,
		placement: 'right',
	})

	useEffect(() => {
		setLocalUrl(avatarUrl)
	}, [avatarUrl])

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const newUrl = await uploadNewAvatar(file)

			setLocalUrl(newUrl)
			onUploaded(newUrl)
		} catch (err) {
			if (err instanceof Error) {
				console.error('Upload failed:', err)
			}
		} finally {
			if (inputRef.current) {
				inputRef.current.value = ''
			}
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
				{localUrl ? (
					<Image src={localUrl} alt='Avatar' width={60} height={60} objectFit='cover' />
				) : (
					<Image src='/avatar.jpg' alt='Default avatar' width={60} height={60} objectFit='cover' />
				)}
				<input type='file' accept='image/*' onChange={handleImageChange} ref={inputRef} hidden />
			</div>
		</div>
	)
}
