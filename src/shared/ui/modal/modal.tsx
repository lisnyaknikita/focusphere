import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import classes from './modal.module.scss'

interface ModalProps {
	isVisible: boolean
	children?: React.ReactNode
	className?: string
	overlayClassname?: string
	onClose: () => void
}

export const Modal = ({ isVisible, children, className, overlayClassname, onClose }: ModalProps) => {
	if (typeof window === 'undefined') return null

	return createPortal(
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={clsx(classes.overlay, overlayClassname)}
					onClick={() => onClose()}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1, transition: { duration: 0.2 } }}
					exit={{ opacity: 0, transition: { duration: 0.2 } }}
				>
					<motion.div
						className={classes.modalPosition}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
						exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
					>
						<motion.div className={classes.modalContainer}>
							<div className={clsx(classes.modal, className)} onClick={e => e.stopPropagation()}>
								{children}
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
