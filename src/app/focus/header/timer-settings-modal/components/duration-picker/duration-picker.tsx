import { useState } from 'react'
import classes from './duration-picker.module.scss'

const durations = {
	flow: [25, 30, 50, 60, 90],
	break: [5, 10, 15],
	sessions: [2, 4, 6],
}

interface DurationPickerProps {
	type: 'flow' | 'break' | 'sessions'
}

export const DurationPicker = ({ type }: DurationPickerProps) => {
	const [index, setIndex] = useState(0)

	const decrement = () => {
		setIndex(prev => (prev > 0 ? prev - 1 : prev))
	}

	const increment = () => {
		setIndex(prev => (prev < durations[type].length - 1 ? prev + 1 : prev))
	}

	return (
		<div className={classes.actions}>
			<button className={classes.minus} onClick={decrement} type='button'>
				<svg width='20' height='2' viewBox='0 0 22 2' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M21.0833 2H0.916667C0.4125 2 0 1.55 0 1C0 0.45 0.4125 0 0.916667 0H21.0833C21.5875 0 22 0.45 22 1C22 1.55 21.5875 2 21.0833 2Z'
						fill='var(--text)'
					/>
				</svg>
			</button>
			<span className={classes.input}>
				{durations[type][index]} {type === 'sessions' ? 'sessions' : 'minutes'}
			</span>
			<button className={classes.plus} onClick={increment} type='button'>
				<svg width='20' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M10.6066 0.258637C10.4409 0.258662 10.2819 0.324509 10.1647 0.441699C10.0476 0.558888 9.98171 0.717824 9.98169 0.883554L9.98169 9.98153L0.88371 9.98153C0.71798 9.98155 0.559044 10.0474 0.441855 10.1646C0.324666 10.2818 0.258819 10.4407 0.258794 10.6064C0.258819 10.7722 0.324666 10.9311 0.441855 11.0483C0.559044 11.1655 0.71798 11.2313 0.88371 11.2314L9.98169 11.2314L9.98169 20.3293C9.98171 20.4951 10.0476 20.654 10.1647 20.7712C10.2819 20.8884 10.4409 20.9542 10.6066 20.9543C10.7723 20.9542 10.9313 20.8884 11.0485 20.7712C11.1656 20.654 11.2315 20.4951 11.2315 20.3293L11.2315 11.2314H20.3295C20.4952 11.2313 20.6542 11.1655 20.7713 11.0483C20.8885 10.9311 20.9544 10.7722 20.9544 10.6064C20.9544 10.4407 20.8885 10.2818 20.7713 10.1646C20.6542 10.0474 20.4952 9.98155 20.3295 9.98153H11.2315L11.2315 0.883554C11.2315 0.717823 11.1656 0.558888 11.0485 0.441699C10.9313 0.32451 10.7723 0.258662 10.6066 0.258637Z'
						fill='var(--text)'
					/>
				</svg>
			</button>
		</div>
	)
}
