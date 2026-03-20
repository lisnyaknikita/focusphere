import { PlusIcon } from '@/shared/ui/icons/plus-icon'
import classes from './create-button.module.scss'

interface AddTimeBlockButtonProps {
	setIsModalVisible: (status: boolean) => void
}

export const AddTimeBlockButton = ({ setIsModalVisible }: AddTimeBlockButtonProps) => {
	return (
		<button className={classes.addTimeBlockButton} onClick={() => setIsModalVisible(true)}>
			<PlusIcon />
			<span>Add time block</span>
		</button>
	)
}
