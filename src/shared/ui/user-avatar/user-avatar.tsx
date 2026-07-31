'use client'

import Avatar from 'boring-avatars'
import Image from 'next/image'

interface UserAvatarProps {
	src?: string | null
	name: string
	size?: number
	style?: React.CSSProperties
	className?: string
}

const AVATAR_COLORS = ['#6C63FF', '#48B2FF', '#FF6B9D', '#FFD166', '#06D6A0']

export const UserAvatar = ({ src, name, size = 40, style, className }: UserAvatarProps) => {
	const containerStyle: React.CSSProperties = {
		width: size,
		height: size,
		borderRadius: 5,
		overflow: 'hidden',
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		...style,
	}

	if (src) {
		return (
			<div style={containerStyle} className={className}>
				<Image src={src} alt={name} width={size} height={size} style={{ objectFit: 'cover', borderRadius: 5 }} />
			</div>
		)
	}

	return (
		<div style={containerStyle} className={className}>
			<Avatar size={size} name={name || 'User'} variant='beam' colors={AVATAR_COLORS} />
		</div>
	)
}
