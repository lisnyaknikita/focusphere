'use client'

import { useOwnerAvatar } from '@/shared/hooks/projects/owner-avatar/use-owner-avatar'
import Image from 'next/image'
import { BeatLoader } from 'react-spinners'

export const OwnerAvatar = ({ userId, size = 30 }: { userId: string; size?: number }) => {
	const { avatarUrl, isLoading } = useOwnerAvatar(userId)

	if (isLoading) {
		return <BeatLoader color='#aaa' size={5} />
	}

	return (
		<Image
			src={avatarUrl || '/avatar.jpg'}
			alt='Owner'
			width={size}
			height={size}
			style={{ borderRadius: 5, objectFit: 'cover', minWidth: size, minHeight: size }}
		/>
	)
}
