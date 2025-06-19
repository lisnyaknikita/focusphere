import Image from 'next/image'
import Link from 'next/link'

import { Logo } from './components/logo/logo'

import classes from './sidebar.module.scss'

export const Sidebar = () => {
	return (
		<div className={classes.sidebar}>
			<Logo isCollapsed={false} />
			<nav className={classes.navigation}>
				<ul className={classes.navigationList}>
					<li className={classes.navigationItem}>
						<button className={classes.navigationItemLink}>
							<Image src={'./hide.svg'} alt='hide' width={20} height={20} />
							<span>Hide</span>
						</button>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/'} className={classes.navigationItemLink}>
							<Image src={'./dashboard.svg'} alt='dashboard' width={20} height={20} />
							<span>Dashboard</span>
						</Link>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/calendar'} className={classes.navigationItemLink}>
							<Image src={'./calendar.svg'} alt='calendar' width={20} height={20} />
							<span>Calendar</span>
						</Link>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/planner'} className={classes.navigationItemLink}>
							<Image src={'./planner.svg'} alt='planner' width={20} height={20} />
							<span>Planner</span>
						</Link>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/projects'} className={classes.navigationItemLink}>
							<Image src={'./projects.svg'} alt='projects' width={20} height={20} />
							<span>Projects</span>
						</Link>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/timer'} className={classes.navigationItemLink}>
							<Image src={'./timer.svg'} alt='timer' width={20} height={20} />
							<span>Focus and timer</span>
						</Link>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/journal'} className={classes.navigationItemLink}>
							<Image src={'./journal.svg'} alt='journal' width={20} height={20} />
							<span>Journal</span>
						</Link>
					</li>
					<li className={classes.navigationItem}>
						<Link href={'/notes'} className={classes.navigationItemLink}>
							<Image src={'./notes.svg'} alt='notes' width={20} height={20} />
							<span>Notes</span>
						</Link>
					</li>
				</ul>
			</nav>
			<button className={classes.userButton}>N</button>
		</div>
	)
}
