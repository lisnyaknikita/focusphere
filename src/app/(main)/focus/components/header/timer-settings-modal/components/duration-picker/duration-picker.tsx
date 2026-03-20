'use client'

import { useTimer } from '@/shared/context/timer-context'
import { MinusIcon } from '@/shared/ui/icons/focus/minus-icon'
import { PlusIcon } from '@/shared/ui/icons/focus/plus-icon'
import classes from './duration-picker.module.scss'

const durations = {
	flow: [25, 30, 45, 50, 60, 90],
	break: [5, 10, 15, 20],
	sessions: [2, 4, 6, 8],
}

interface DurationPickerProps {
	type: 'flow' | 'break' | 'sessions'
}

export const DurationPicker = ({ type }: DurationPickerProps) => {
	const { settings, updateSettings } = useTimer()

	const settingsMap = {
		flow: 'flowDuration',
		break: 'breakDuration',
		sessions: 'totalSessions',
	} as const

	const currentValue = settings[settingsMap[type]]
	const options = durations[type]
	const currentIndex = options.indexOf(currentValue)

	const increment = () => {
		if (currentIndex < options.length - 1) {
			updateSettings({ [settingsMap[type]]: options[currentIndex + 1] })
		}
	}

	const decrement = () => {
		if (currentIndex > 0) {
			updateSettings({ [settingsMap[type]]: options[currentIndex - 1] })
		}
	}

	return (
		<div className={classes.actions}>
			<button className={classes.minus} onClick={decrement} type='button'>
				<MinusIcon />
			</button>
			<span className={classes.input}>
				{currentValue} {type === 'sessions' ? 'sessions' : 'minutes'}
			</span>
			<button className={classes.plus} onClick={increment} type='button'>
				<PlusIcon />
			</button>
		</div>
	)
}
