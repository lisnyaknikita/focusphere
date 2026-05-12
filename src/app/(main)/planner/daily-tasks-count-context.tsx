'use client'

import {createContext, useContext} from 'react'

export const DailyTasksCountByDateContext = createContext<Record<string, number>>({})

export const useDailyTasksCountForDate = (date: string) => {
    const map = useContext(DailyTasksCountByDateContext)
    return map[date] ?? 0
}
