import { PlusIcon } from '../icons/plus-icon'
import classes from './create-button.module.scss'

interface CreateButtonProps {
	setIsModalVisible: (status: boolean) => void
	text: string
}

export const CreateButton = ({ setIsModalVisible, text }: CreateButtonProps) => {
	return (
		<button className={classes.createButton} onClick={() => setIsModalVisible(true)}>
			<PlusIcon />
			<span>{text}</span>
		</button>
	)
}
