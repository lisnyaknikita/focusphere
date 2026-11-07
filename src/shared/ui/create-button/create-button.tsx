import { PlusIcon } from '../icons/plus-icon'
import classes from './create-button.module.scss'

interface CreateButtonProps {
	setIsModalVisible: (status: boolean) => void
	text: string
	disabled?: boolean
}

export const CreateButton = ({ setIsModalVisible, text, disabled = false }: CreateButtonProps) => {
	return (
		<button className={classes.createButton} onClick={() => setIsModalVisible(true)} disabled={disabled}>
			<PlusIcon />
			<span>{text}</span>
		</button>
	)
}
