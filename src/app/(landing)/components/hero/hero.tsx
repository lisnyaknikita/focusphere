'use client'

import Link from 'next/link'
import classes from './hero.module.scss'

export const Hero = () => {
	return (
		<section className={classes.hero}>
			<div className={classes.container}>
				<h1 className={classes.title}>
					Your mind, <span className={classes.highlight}>organized</span>
				</h1>

				<p className={classes.subtitle}>
					One place for everything that matters. Calendar, projects, focus timers, journal, and notes — unified in a single, beautiful workspace.
				</p>

				<div className={classes.cta}>
					<Link href="/signup" className={classes.primaryBtn}>
						Get started free
					</Link>
					<button className={classes.secondaryBtn}>
						<svg className={classes.playIcon} viewBox="0 0 24 24" fill="currentColor">
							<polygon points="5,3 19,12 5,21" />
						</svg>
						Watch demo
					</button>
				</div>

				<div className={classes.preview}>
					<div className={classes.glow} />
					<div className={classes.mockup}>
						<div className={classes.mockupHeader}>
							<div className={classes.dots}>
								<span className={classes.dot} data-color="red" />
								<span className={classes.dot} data-color="yellow" />
								<span className={classes.dot} data-color="green" />
							</div>
							<span className={classes.mockupTitle}>Focusphere</span>
						</div>
						<div className={classes.mockupContent}>
							<div className={classes.sidebar}>
								<div className={classes.sidebarLogo} />
								<div className={classes.sidebarItems}>
									<div className={classes.sidebarItem} data-active="true" />
									<div className={classes.sidebarItem} />
									<div className={classes.sidebarItem} />
									<div className={classes.sidebarItem} />
									<div className={classes.sidebarItem} />
								</div>
							</div>
							<div className={classes.panels}>
								{/* Calendar Panel */}
								<div className={classes.panel} data-type="calendar">
									<div className={classes.panelHeader}>
										<div className={classes.panelTitle} />
										<div className={classes.panelActions}>
											<span />
											<span />
										</div>
									</div>
									<div className={classes.calendarGrid}>
										{Array.from({ length: 7 }).map((_, i) => (
											<div key={i} className={classes.calendarDay}>
												<span className={classes.dayLabel} />
												<div className={classes.events}>
													{i === 1 && <div className={classes.event} data-color="blue" />}
													{i === 2 && (
														<>
															<div className={classes.event} data-color="purple" />
															<div className={classes.event} data-color="green" />
														</>
													)}
													{i === 4 && <div className={classes.event} data-color="orange" />}
													{i === 5 && <div className={classes.event} data-color="blue" />}
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Kanban Panel */}
								<div className={classes.panel} data-type="kanban">
									<div className={classes.panelHeader}>
										<div className={classes.panelTitle} />
									</div>
									<div className={classes.kanbanBoard}>
										<div className={classes.kanbanColumn}>
											<div className={classes.columnHeader} />
											<div className={classes.kanbanCard}>
												<div className={classes.cardLine} />
												<div className={classes.cardLine} data-short="true" />
												<div className={classes.avatarGroup}>
													<span className={classes.miniAvatar} />
													<span className={classes.miniAvatar} />
												</div>
											</div>
											<div className={classes.kanbanCard}>
												<div className={classes.cardLine} />
											</div>
										</div>
										<div className={classes.kanbanColumn}>
											<div className={classes.columnHeader} />
											<div className={classes.kanbanCard}>
												<div className={classes.cardLine} />
												<div className={classes.cardLine} data-short="true" />
											</div>
										</div>
										<div className={classes.kanbanColumn}>
											<div className={classes.columnHeader} />
											<div className={classes.kanbanCard}>
												<div className={classes.cardLine} />
												<div className={classes.miniAvatar} />
											</div>
										</div>
									</div>
								</div>

								{/* Timer Panel */}
								<div className={classes.panel} data-type="timer">
									<div className={classes.timerCircle}>
										<svg viewBox="0 0 100 100" className={classes.timerRing}>
											<circle cx="50" cy="50" r="45" className={classes.timerBg} />
											<circle cx="50" cy="50" r="45" className={classes.timerProgress} />
										</svg>
										<span className={classes.timerText}>25:00</span>
									</div>
									<div className={classes.timerLabel}>Focus Session</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className={classes.trustedBy}>
					<span className={classes.trustedLabel}>Trusted by teams at</span>
					<div className={classes.logos}>
						<div className={classes.logoPlaceholder}>Linear</div>
						<div className={classes.logoPlaceholder}>Vercel</div>
						<div className={classes.logoPlaceholder}>Stripe</div>
						<div className={classes.logoPlaceholder}>Notion</div>
						<div className={classes.logoPlaceholder}>Figma</div>
					</div>
				</div>
			</div>
		</section>
	)
}
