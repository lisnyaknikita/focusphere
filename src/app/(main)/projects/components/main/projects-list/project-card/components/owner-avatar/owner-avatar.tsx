'use client'

import { useOwnerAvatar } from '@/shared/hooks/projects/owner-avatar/use-owner-avatar'
import { UserAvatar } from '@/shared/ui/user-avatar/user-avatar'
import { BeatLoader } from 'react-spinners'

export const OwnerAvatar = ({ userId, size = 30 }: { userId: string; size?: number }) => {
	const { avatarUrl, isLoading } = useOwnerAvatar(userId)

	if (isLoading) {
		return <BeatLoader color='#aaa' size={5} />
	}

	return (
		<UserAvatar
			src={avatarUrl}
			name={userId}
			size={size}
			style={{ borderRadius: 5, minWidth: size, minHeight: size }}
		/>
	)
}
