import { useMemo } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../../app/theme/useTheme'

export function useThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return useMemo(() => ({
    nextTheme,
    actionLabel: 'Activer le thème ' + (nextTheme === 'dark' ? 'sombre' : 'clair'),
    visibleLabel: nextTheme === 'dark' ? 'Sombre' : 'Clair',
    Icon: nextTheme === 'dark' ? Moon : Sun,
    toggleTheme,
  }), [nextTheme, toggleTheme])
}
