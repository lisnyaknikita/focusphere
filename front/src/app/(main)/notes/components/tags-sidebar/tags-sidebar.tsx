import { CreateButton } from './create-button/create-button'
import classes from './tags-sidebar.module.scss'

interface TagsSidebarProps {
	setIsTagsModalVisible: (status: boolean) => void
}

export const TagsSidebar = ({ setIsTagsModalVisible }: TagsSidebarProps) => {
	return (
		<div className={classes.tagsSidebar}>
			<h4 className={classes.title}>Tags</h4>
			<ul className={classes.tagsList}>
				<li className={classes.tag}>#health</li>
				<li className={classes.tag}>#ideas</li>
			</ul>
			<CreateButton setIsModalVisible={setIsTagsModalVisible} />
		</div>
	)
}
