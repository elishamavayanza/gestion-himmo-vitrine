import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from '../../UI/ThemeToggle'
import { BrandLogo } from '../../BrandLogo'
import { usePublicLayout, type PublicLayoutOptions } from './usePublicLayout'

interface PublicLayoutProps extends PublicLayoutOptions {
  children: ReactNode
}

export function PublicLayout({ children, ...options }: PublicLayoutProps) {
  const layout = usePublicLayout(options)
  const visibleBrandName = layout.brandName.replace(/^H/, '')
  const organizationHref = layout.organizationSlug
    ? `/organisations/${encodeURIComponent(layout.organizationSlug)}`
    : null

  return (
    <div className="public-layout">
      <a className="skip-link" href="#main-content">Passer au contenu</a>
      <header id="page-top" className="public-header" onKeyDown={layout.onMenuKeyDown}>
        <Link className="brand" to={layout.homeHref} aria-label={`${layout.brandName} ${layout.brandSuffix}, ${layout.homeLabel.toLowerCase()}`}>
          <BrandLogo className="brand-mark" />
          <span className="brand__text">{visibleBrandName} <span className="brand-light">{layout.brandSuffix}</span></span>
        </Link>
        <nav id="public-navigation" className={`public-navigation${layout.menuOpen ? ' public-navigation--open' : ''}`} aria-label="Navigation principale">
          <NavLink end to="/" onClick={layout.closeMenu}>{layout.homeLabel}</NavLink>
          <NavLink to="/annonces" onClick={layout.closeMenu}>Toutes les annonces</NavLink>
          <NavLink to="/a-propos" onClick={layout.closeMenu}>À propos</NavLink>
        </nav>
        <div className="public-header__actions">
          <ThemeToggle />
          <button className="public-menu-toggle" type="button" aria-expanded={layout.menuOpen} aria-controls="public-navigation" aria-label={layout.menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={layout.toggleMenu}>
            <span aria-hidden="true">{layout.menuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </header>
      {organizationHref && (
        <nav className="organization-navigation" aria-label="Navigation de la vitrine">
          <span className="organization-navigation__label">Espace de l’agence</span>
          <div className="organization-navigation__links">
            <NavLink end to={organizationHref}>Accueil agence</NavLink>
            <NavLink to={`${organizationHref}/annonces`}>Annonces de l’agence</NavLink>
            <NavLink to={`${organizationHref}/contact`}>Contact agence</NavLink>
          </div>
        </nav>
      )}
      <div id="main-content" className="public-layout__content" tabIndex={-1}>{children}</div>
      <footer className="public-footer">
        <div className="public-footer__main">
          <section className="public-footer__identity" aria-label={`${layout.brandName} ${layout.brandSuffix}`}>
            <Link className="brand public-footer__brand" to={layout.homeHref}>
              <BrandLogo className="brand-mark" />
              <span className="brand__text">{visibleBrandName} <span className="brand-light">{layout.brandSuffix}</span></span>
            </Link>
            <p>{layout.footerMessage}</p>
          </section>
          <nav className="public-footer__links" aria-label="Liens de pied de page">
            <h2>Explorer</h2>
            <Link to={organizationHref ?? '/'}>{layout.homeLabel}</Link>
            <Link to="/a-propos">À propos</Link>
            {organizationHref && <Link to={`${organizationHref}/annonces`}>Annonces de l’agence</Link>}
          </nav>
          <section className="public-footer__contact">
            <h2>{organizationHref ? 'Contacter cette agence' : 'Besoin d’un renseignement ?'}</h2>
            {organizationHref ? (
              <>
                <p>Pour une question sur un bien, contactez directement l’agence.</p>
                <Link to={`${organizationHref}/contact`}>Coordonnées de l’agence</Link>
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
