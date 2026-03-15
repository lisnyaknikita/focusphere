import Image from 'next/image'
import classes from './features.module.scss'

const features = [
	{
		title: 'Calendar',
		description:
			'Months/Week/Day views with time blocks and colored events. Schedule your days visually and never double-book again.',
		visual: 'calendar',
		reverse: false,
	},
	{
		title: 'Projects',
		description:
			'Everything your project needs on one page - Kanban board to track progress, built-in team chat to stay aligned, and project-specific notes so nothing gets lost.',
		visual: 'kanban',
		reverse: true,
	},
	{
		title: 'Focus Timer',
		description:
			'Beautiful timer with sound waves and ambient sounds. Pink noise, Brown noise, Lofi music - find your flow.',
		visual: 'timer',
		reverse: false,
	},
	{
		title: 'Journal',
		description: 'Entry pages with templates and warm lighting. Reflect on your day with guided prompts.',
		visual: 'journal',
		reverse: true,
	},
]

const CalendarVisual = () => (
	<div className={classes.calendarVisual}>
		<div className={classes.calendarHeader}>
			<span>Mon</span>
			<span>Tue</span>
			<span>Wed</span>
			<span>Thu</span>
			<span>Fri</span>
		</div>
		<div className={classes.calendarBody}>
			{[...Array(5)].map((_, dayIndex) => (
				<div key={dayIndex} className={classes.dayColumn}>
					{[...Array(6)].map((_, hourIndex) => (
						<div key={hourIndex} className={classes.timeSlot}>
							{dayIndex === 0 && hourIndex === 1 && (
								<div className={classes.eventBlock} data-color='blue' style={{ height: '60px' }}>
									<span>Team standup</span>
								</div>
							)}
							{dayIndex === 1 && hourIndex === 2 && (
								<div className={classes.eventBlock} data-color='purple' style={{ height: '90px' }}>
									<span>Deep work</span>
								</div>
							)}
							{dayIndex === 2 && hourIndex === 0 && (
								<div className={classes.eventBlock} data-color='green' style={{ height: '45px' }}>
									<span>1:1 Meeting</span>
								</div>
							)}
							{dayIndex === 3 && hourIndex === 3 && (
								<div className={classes.eventBlock} data-color='orange' style={{ height: '60px' }}>
									<span>Review</span>
								</div>
							)}
							{dayIndex === 4 && hourIndex === 1 && (
								<div className={classes.eventBlock} data-color='blue' style={{ height: '75px' }}>
									<span>Planning</span>
								</div>
							)}
						</div>
					))}
				</div>
			))}
		</div>
	</div>
)

const KanbanVisual = () => <Image src={'/projects.png'} alt='Projects' width={568} height={350} />

const TimerVisual = () => <Image src={'/timer.png'} alt='Projects' width={568} height={298} />

const JournalVisual = () => (
	<div className={classes.journalVisual}>
		<div className={classes.journalHeader}>
			<span className={classes.journalDate}>March 15, 2026</span>
			<span className={classes.journalMood}>Feeling great</span>
		</div>
		<div className={classes.journalPrompt}>What are you grateful for today?</div>
		<div className={classes.journalContent}>
			<p>Today I finished the big project ahead of schedule. The team was really supportive and...</p>
		</div>
		<div className={classes.journalTemplate}>
			<span>Evening Reflection</span>
		</div>
	</div>
)

export const Features = () => {
	const renderVisual = (type: string) => {
		switch (type) {
			case 'calendar':
				return <CalendarVisual />
			case 'kanban':
				return <KanbanVisual />
			case 'timer':
				return <TimerVisual />
			case 'journal':
				return <JournalVisual />
			default:
				return null
		}
	}

	return (
		<section id='features' className={classes.features}>
			<div className={classes.container}>
				<div className={classes.header}>
					<span className={classes.label}>Features</span>
					<h2 className={classes.title}>Everything in one place</h2>
					<p className={classes.subtitle}>Five powerful tools, unified in a single workspace. No more app switching.</p>
				</div>

				{features.map((feature, index) => (
					<div key={index} className={classes.featureRow} data-reverse={feature.reverse}>
						<div className={classes.featureContent}>
							<h3 className={classes.featureTitle}>{feature.title}</h3>
							<p className={classes.featureDescription}>{feature.description}</p>
						</div>
						<div className={classes.featureVisual}>{renderVisual(feature.visual)}</div>
					</div>
				))}
			</div>
		</section>
	)
}
