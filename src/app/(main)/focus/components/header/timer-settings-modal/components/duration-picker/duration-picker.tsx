'use client'

import { useTimerStore } from '@/shared/stores/timer.store'
import { MinusIcon } from '@/shared/ui/icons/focus/minus-icon'
import { PlusIcon } from '@/shared/ui/icons/focus/plus-icon'
import classes from './duration-picker.module.scss'

interface DurationPickerProps {
	type: 'flow' | 'break' | 'sessions'
}

const bounds = {
	flow: { min: 5, max: 120, step: 5 },
	break: { min: 1, max: 30, step: 1 },
	sessions: { min: 1, max: 12, step: 1 },
} as const

const settingsMap = {
	flow: 'flowDuration',
	break: 'breakDuration',
	sessions: 'totalSessions',
} as const

export const DurationPicker = ({ type }: DurationPickerProps) => {
	const settings = useTimerStore(state => state.settings)
	const updateSettings = useTimerStore(state => state.updateSettings)

	const config = bounds[type]
	const settingKey = settingsMap[type]
	const currentValue = settings[settingKey] ?? config.min

	const isMin = currentValue <= config.min
	const isMax = currentValue >= config.max

	const increment = () => {
		if (!isMax) {
			const newValue = Math.min(currentValue + config.step, config.max)
			updateSettings({ [settingKey]: newValue })
		}
	}

	const decrement = () => {
		if (!isMin) {
			const newValue = Math.max(currentValue - config.step, config.min)
			updateSettings({ [settingKey]: newValue })
		}
	}

	const getUnitLabel = () => {
		if (type === 'sessions') {
			return currentValue === 1 ? 'session' : 'sessions'
		}
		return 'minutes'
	}

	return (
		<div className={classes.actions}>
			<button
				className={classes.minus}
				onClick={decrement}
				disabled={isMin}
				type='button'
				aria-label={`Decrease ${type}`}
			>
				<MinusIcon />
			</button>
			<span className={classes.input}>
				{currentValue} {getUnitLabel()}
			</span>
			<button
				className={classes.plus}
				onClick={increment}
				disabled={isMax}
				type='button'
				aria-label={`Increase ${type}`}
			>
				<PlusIcon />
			</button>
		</div>
	)
}
