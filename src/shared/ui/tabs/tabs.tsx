import classes from './tabs.module.scss'

interface TabsProps<T extends string> {
	tabs: T[]
	activeTab: T
	onChange: (tab: T) => void
	lockedTabs?: T[]
}

export function Tabs<T extends string>({ tabs, activeTab, onChange, lockedTabs = [] }: TabsProps<T>) {
	return (
		<div className={classes.tabs}>
			{tabs.map(tab => {
				const isLocked = lockedTabs.includes(tab)

				return (
					<button
						key={tab}
						className={`${classes.tab} ${activeTab === tab ? classes.active : ''} ${isLocked ? classes.lockedTab : ''}`}
						onClick={() => onChange(tab)}
					>
						{tab}
					</button>
				)
			})}
		</div>
	)
}
