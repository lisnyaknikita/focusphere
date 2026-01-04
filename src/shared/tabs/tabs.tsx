import classes from './tabs.module.scss'

interface TabsProps<T extends string> {
	tabs: T[]
	activeTab: T
	onChange: (tab: T) => void
}

export function Tabs<T extends string>({ tabs, activeTab, onChange }: TabsProps<T>) {
	return (
		<div className={classes.tabs}>
			{tabs.map(tab => (
				<button
					key={tab}
					className={`${classes.tab} ${activeTab === tab ? classes.active : ''}`}
					onClick={() => onChange(tab)}
				>
					{tab}
				</button>
			))}
		</div>
	)
}
