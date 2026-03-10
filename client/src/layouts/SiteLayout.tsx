import { NavLink, Outlet } from 'react-router-dom';
import '../css/SiteLayout.css';

export const SiteLayout = () => {
  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `site-layout__nav-link${isActive ? ' site-layout__nav-link--active' : ''}`;

  return (
    <div className="site-layout">
      <header className="site-layout__header">
        <h1 className="site-layout__title">Demo Site</h1>
        <nav className="site-layout__nav">
          <NavLink to="/" className={navLinkClassName} end>
            Home
          </NavLink>
          <NavLink to="/properties" className={navLinkClassName}>
            Properties
          </NavLink>
          <NavLink to="/about" className={navLinkClassName}>
            About
          </NavLink>
          <NavLink to="/blog" className={navLinkClassName}>
            Blog
          </NavLink>
          <NavLink to="/neighborhood-guides" className={navLinkClassName}>
            Neighborhood Guides
          </NavLink>
          <NavLink to="/lets-connect" className={navLinkClassName}>
            Let's Connect
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
};
