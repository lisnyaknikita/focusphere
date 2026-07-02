import { CheckboxCard } from '@/shared/ui/checkbox-card/checkbox-card'
import { useState } from 'react'
import classes from './convert-to-solo-modal.module.scss'

interface ConvertToSoloModalProps {
	onCancel: () => void
	onConfirm: (deleteTeamData: boolean) => void
}

export const ConvertToSoloModal = ({ onCancel, onConfirm }: ConvertToSoloModalProps) => {
	const [deleteTeamData, setDeleteTeamData] = useState(false)

	return (
		<div className={classes.modalInner}>
			<div className={classes.modalContent}>
				<div className={classes.title}>
					<h6>Convert to Solo Project</h6>
				</div>
				<p className={classes.modalDescription}>
					You are changing the project type to <strong>Solo</strong>. Team members will immediately lose access to this
					project.
				</p>
				<CheckboxCard
					label={'Delete team history permanently'}
					checked={deleteTeamData}
					onCheck={setDeleteTeamData}
					withBorder={true}
					preventLineThrough={true}
				/>
			</div>

			<div className={classes.modalActions}>
				<button type='button' className={classes.cancelButton} onClick={onCancel}>
					Cancel
				</button>
				<button type='button' className={classes.confirmButton} onClick={() => onConfirm(deleteTeamData)}>
					Confirm Conversion
				</button>
			</div>
		</div>
	)
}
