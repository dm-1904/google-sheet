import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../css/SiteLayout.css';

interface NavItem {
  label: string;
  href: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', end: true },
  { label: 'Properties', href: '/properties' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Neighborhood Guides', href: '/neighborhood-guides' },
  { label: "Let's Connect", href: '/lets-connect' },
];

export const SiteLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? ' nav-link--active' : ''}`;

  return (
    <div className="site-layout">
      <header className="nav-header">
        <div className="nav-box">
          <div className="nav-img-box">
            <img
              src="/nav/DesertValleyHomeSearch-com.png"
              alt="Desert Valley Home Search Logo"
              className="nav-logo-img"
            />
            <div className="nav-name-img-box">
              <img
                src="/nav/Presented-by.png"
                alt="Presented by"
                className="presented-by"
              />
              <img
                src="/nav/Damon-Ryon-2.png"
                alt="Damon Ryon"
                className="name-img-logo"
              />
            </div>
            <img
              src="/nav/Damon-P.jpg"
              alt="Damon portrait"
              className="damon-picture"
            />
          </div>

          <button
            type="button"
            className={`nav-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>

          <nav
            id="site-navigation"
            className={`nav-link-box ${menuOpen ? 'open' : ''}`}
            aria-label="Main navigation"
          >
            {navItems.map(({ label, href, end }) => (
              <NavLink
                key={href}
                to={href}
                end={end}
                className={navLinkClassName}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-layout__content">
        <Outlet />
      </main>
    </div>
  );
};
