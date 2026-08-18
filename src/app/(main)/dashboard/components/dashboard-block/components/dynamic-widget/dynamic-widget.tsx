'use client'

import { DashboardWidgetType } from '@/shared/types/dashboard-widget'
import { useEffect, useState } from 'react'
import { WidgetDropdown } from './components/widget-dropdown/widget-dropdown'
import classes from './dynamic-widget.module.scss'
import { PomodoroStats } from './views/pomodoro-stats/pomodoro-stats'
import { QuotesView } from './views/quotes-view/quotes-view'
import { TimeBlocksTimeline } from './views/time-blocks-timeline/timeblock-timeline'

const STORAGE_KEY = 'focusphere_dashboard_widget'

export const DynamicWidget = () => {
	const [widgetType, setWidgetType] = useState<DashboardWidgetType>('quotes')

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY) as DashboardWidgetType | null
		if (saved && ['quotes', 'timeblocks', 'pomodoro'].includes(saved)) {
			setWidgetType(saved)
		}
	}, [])

	const handleWidgetChange = (newType: DashboardWidgetType) => {
		setWidgetType(newType)
		localStorage.setItem(STORAGE_KEY, newType)
	}

	return (
		<section className={classes.dynamicWidget}>
			<div className={classes.header}>
				<WidgetDropdown value={widgetType} onChange={handleWidgetChange} />
			</div>

			<div className={classes.content}>
				{widgetType === 'quotes' && <QuotesView />}
				{widgetType === 'timeblocks' && <TimeBlocksTimeline />}
				{widgetType === 'pomodoro' && <PomodoroStats />}
			</div>
		</section>
	)
}
