import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from '../../UI/ThemeToggle'
import { usePublicLayout, type PublicLayoutOptions } from './usePublicLayout'

interface PublicLayoutProps extends PublicLayoutOptions {
  children: ReactNode
}

export function PublicLayout({ children, ...options }: PublicLayoutProps) {
  const layout = usePublicLayout(options)
  const organizationHref = layout.organizationSlug
    ? `/organisations/${encodeURIComponent(layout.organizationSlug)}`
    : null

  return (
    <div className="public-layout">
      <a className="skip-link" href="#main-content">Passer au contenu</a>
      <header id="page-top" className="public-header" onKeyDown={layout.onMenuKeyDown}>
        <Link className="brand" to={layout.homeHref} aria-label={`${layout.brandName} ${layout.brandSuffix}, ${layout.homeLabel.toLowerCase()}`}>
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>{layout.brandName} <span className="brand-light">{layout.brandSuffix}</span></span>
        </Link>
        <nav id="public-navigation" className={`public-navigation${layout.menuOpen ? ' public-navigation--open' : ''}`} aria-label="Navigation principale">
          <NavLink end to={organizationHref ?? '/'} onClick={layout.closeMenu}>{layout.homeLabel}</NavLink>
          {organizationHref && <NavLink to={`${organizationHref}/annonces`} onClick={layout.closeMenu}>Trouver un bien</NavLink>}
          <NavLink to="/a-propos" onClick={layout.closeMenu}>À propos</NavLink>
          {organizationHref && <a href={`${organizationHref}#contact`} onClick={layout.closeMenu}>Contact</a>}
        </nav>
        <div className="public-header__actions">
          <ThemeToggle />
          <button className="public-menu-toggle" type="button" aria-expanded={layout.menuOpen} aria-controls="public-navigation" aria-label={layout.menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={layout.toggleMenu}>
            <span aria-hidden="true">{layout.menuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </header>
      <div id="main-content" className="public-layout__content" tabIndex={-1}>{children}</div>
      <footer className="public-footer">
        <div className="public-footer__main">
          <section className="public-footer__identity" aria-label={`${layout.brandName} ${layout.brandSuffix}`}>
            <Link className="brand public-footer__brand" to={layout.homeHref}>
              <span className="brand-mark" aria-hidden="true">H</span>
              <span>{layout.brandName} <span className="brand-light">{layout.brandSuffix}</span></span>
            </Link>
            <p>{layout.footerMessage}</p>
          </section>
          <nav className="public-footer__links" aria-label="Liens de pied de page">
            <h2>Explorer</h2>
            <Link to={organizationHref ?? '/'}>{layout.homeLabel}</Link>
            <Link to="/a-propos">À propos</Link>
            {organizationHref && <Link to={`${organizationHref}/annonces`}>Trouver un bien</Link>}
          </nav>
          <section className="public-footer__contact">
            <h2>{organizationHref ? 'Contacter cette agence' : 'Besoin d’un renseignement ?'}</h2>
            {organizationHref ? (
              <>
                <p>Pour une question sur un bien, contactez directement l’agence.</p>
                <a href={`${organizationHref}#contact`}>Coordonnées de l’agence</a>
              </>
            ) : (
              <>
                <p>Les coordonnées sont disponibles sur la vitrine de chaque agence.</p>
                <Link to="/#trouver-une-vitrine">Accéder à une vitrine</Link>
              </>
            )}
          </section>
        </div>
        <div className="public-footer__bottom">
          <span>© {layout.currentYear} {layout.brandName} {layout.brandSuffix}</span>
          <a href="#page-top">Retour en haut ↑</a>
        </div>
      </footer>
    </div>
  )
}
