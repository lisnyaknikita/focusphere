import { CalendarView } from '@/app/calendar/page'
import classes from './tabs.module.scss'

const tabs: CalendarView[] = ['month', 'week', 'day']

interface TabsProps {
	activeTab: CalendarView
	onChange: (tab: CalendarView) => void
}

export const Tabs = ({ activeTab, onChange }: TabsProps) => {
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
