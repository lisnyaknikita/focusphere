import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
	isCollapsed: boolean
	isMobileOpen: boolean
	toggleSidebar: () => void
	setIsMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
	persist(
		set => ({
			isCollapsed: false,
			isMobileOpen: false,

			toggleSidebar: () => {
				if (typeof window !== 'undefined' && window.innerWidth <= 768) {
					set(state => ({ isMobileOpen: !state.isMobileOpen }))
				} else {
					set(state => ({ isCollapsed: !state.isCollapsed }))
				}
			},

			setIsMobileOpen: open => set({ isMobileOpen: open }),
		}),
		{
			name: 'sidebar-collapsed',
			partialize: state => ({ isCollapsed: state.isCollapsed }),
		}
	)
)
