'use client'

import { Modal } from '@/shared/ui/modal/modal'
import classes from './image-preview-modal.module.scss'

interface ImagePreviewModalProps {
	src: string | null
	onClose: () => void
}

export const ImagePreviewModal = ({ src, onClose }: ImagePreviewModalProps) => {
	return (
		<Modal isVisible={!!src} onClose={onClose} className={classes.imageModalContent}>
			{src && (
				<div className={classes.imageWrapper}>
					<img src={src} alt='Preview' className={classes.previewImage} />
				</div>
			)}
		</Modal>
	)
}
