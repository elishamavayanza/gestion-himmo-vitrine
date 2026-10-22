import { useThemeToggle } from './useThemeToggle'

export function ThemeToggle() {
  const { actionLabel, visibleLabel, Icon, toggleTheme } = useThemeToggle()

  return (
    <button
      className="ui-theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{visibleLabel}</span>
    </button>
  )
}
