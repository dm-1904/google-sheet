import { NavLink, Outlet } from 'react-router-dom';

const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: 900,
  padding: '1rem',
  fontFamily: 'Arial, sans-serif',
};

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: isActive ? '#1f4ea5' : '#2f2f2f',
  fontWeight: isActive ? 700 : 500,
  textDecoration: 'none',
});

export const SiteLayout = () => {
  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.75rem' }}>Demo Site</h1>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <NavLink to="/" style={navLinkStyle} end>
            Home
          </NavLink>
          <NavLink to="/properties" style={navLinkStyle}>
            Properties
          </NavLink>
          <NavLink to="/about" style={navLinkStyle}>
            About
          </NavLink>
          <NavLink to="/blog" style={navLinkStyle}>
            Blog
          </NavLink>
          <NavLink to="/neighborhood-guides" style={navLinkStyle}>
            Neighborhood Guides
          </NavLink>
          <NavLink to="/lets-connect" style={navLinkStyle}>
            Let's Connect
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
};
