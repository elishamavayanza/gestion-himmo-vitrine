import type { ReactNode } from 'react'
import { ThemeToggle } from '../../UI/ThemeToggle'
import { usePublicLayout, type PublicLayoutOptions } from './usePublicLayout'

interface PublicLayoutProps extends PublicLayoutOptions {
  children: ReactNode
}

export function PublicLayout({ children, ...options }: PublicLayoutProps) {
  const layout = usePublicLayout(options)

  return (
    <div className="public-layout">
      <header className="public-header">
        <a className="brand" href={layout.homeHref} aria-label={layout.brandName + ' ' + layout.brandSuffix + ', ' + layout.homeLabel.toLowerCase()}>
          <span className="brand-mark" aria-hidden="true">{layout.brandName.slice(0, 1)}</span>
          <span>{layout.brandName} <span className="brand-light">{layout.brandSuffix}</span></span>
        </a>
        <nav aria-label="Navigation principale">
          <a href={layout.homeHref}>{layout.homeLabel}</a>
          <ThemeToggle />
        </nav>
      </header>
      {children}
      <footer className="public-footer">
        <span>© {layout.currentYear} {layout.brandName} {layout.brandSuffix}</span>
        <span>{layout.footerMessage}</span>
      </footer>
    </div>
  )
}
