'use client'

import classes from './focus-mode.module.scss'

const sounds = [
	{ icon: '🌧', label: 'Rain' },
	{ icon: '☕', label: 'Cafe' },
	{ icon: '🌊', label: 'Ocean' },
	{ icon: '🌲', label: 'Forest' },
]

export const FocusMode = () => {
	return (
		<section className={classes.focusMode}>
			<div className={classes.backdrop} />
			<div className={classes.container}>
				<div className={classes.content}>
					<h2 className={classes.title}>Block the noise. Find your flow.</h2>
					<p className={classes.subtitle}>
						Immersive focus sessions with ambient sounds and beautiful visualizations.
					</p>

					<div className={classes.timerDisplay}>
						<div className={classes.timerGlow} />
						<div className={classes.timer}>
							<svg viewBox="0 0 200 200" className={classes.timerRing}>
								<defs>
									<linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#3b82f6" />
										<stop offset="100%" stopColor="#8b5cf6" />
									</linearGradient>
								</defs>
								<circle cx="100" cy="100" r="90" className={classes.timerBg} />
								<circle cx="100" cy="100" r="90" className={classes.timerProgress} />
							</svg>
							<div className={classes.timerInner}>
								<span className={classes.timerTime}>25:00</span>
								<span className={classes.timerLabel}>Focus Session</span>
							</div>
						</div>

						<div className={classes.soundWave}>
							{[...Array(12)].map((_, i) => (
								<span
									key={i}
									className={classes.waveLine}
									style={{ animationDelay: `${i * 0.08}s` }}
								/>
							))}
						</div>
					</div>

					<div className={classes.sounds}>
						{sounds.map((sound, index) => (
							<button
								key={index}
								className={classes.soundBtn}
								data-active={index === 0}
							>
								<span className={classes.soundIcon}>{sound.icon}</span>
								<span className={classes.soundLabel}>{sound.label}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
