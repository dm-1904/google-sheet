import type { SyntheticEvent } from 'react';
import { NavLink } from 'react-router-dom';
import '../css/footer.css';

interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Neighborhood Guides', href: '/neighborhood-guides' },
  { label: "Let's Connect", href: '/lets-connect' },
];

const hideImageOnError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.display = 'none';
};

export const Footer = () => {
  const year = new Date().getFullYear();
  const lastUpdated = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  const footerNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `footer-menu-item nav-link${isActive ? ' nav-link--active' : ''}`;

  return (
    <>
      <span className="footer-underline" />
      <footer className="footer">
        <div className="footer-content">
          <h3 className="footer-menu">Menu</h3>
          <div className="footer-menu">
            {menuItems.map(({ label, href }) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/'}
                className={footerNavLinkClassName}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="footer-logo">
            <img
              src="/broker-logo-transparent.png"
              alt="Deal Landers Arizona Realty broker logo"
              className="footer-broker-logo"
              onError={hideImageOnError}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="broker-address">
            <span>
              Deal Landers Arizona Realty
              <br />
              17310 W Wildwood St.
              <br />
              Surprise, AZ 85388
              <br />
              623-295-8169
            </span>
          </div>

          <div className="ryon-group-logo">
            <img
              src="/nav/ryon-group.png"
              alt="Ryon Group logo"
              onError={hideImageOnError}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="footer-realtor-logos">
            <img
              src="/equal-housing-opportunity.png"
              alt="Equal housing opportunity logo"
              className="footer-equal-housing-logo"
              onError={hideImageOnError}
              loading="lazy"
              decoding="async"
            />
            <img
              src="/MLS-clear.png"
              alt="MLS logo"
              className="footer-mls-logo"
              onError={hideImageOnError}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="footer-disc">
            <NavLink to="/terms-of-use">TERMS OF USE</NavLink>
            <NavLink to="/privacy-policy">PRIVACY POLICY</NavLink>
            <NavLink to="/dmca">DMCA</NavLink>
          </div>
        </div>
      </footer>

      <div className="footer-disc-statement">
        <p>
          © {year} Arizona Regional Multiple Listing Service • All Rights Reserved • The data relating to real
          estate for sale on this website comes in part from the Arizona Regional Multiple Listing Service. Real
          estate listings held by brokerage firms other than Damon Ryon - Deal Landers Arizona Realty are marked
          with the Arizona Regional Multiple Listing Service logo and detailed information about them includes the
          name of the listing brokers. All information deemed reliable but not guaranteed and should be
          independently verified. All properties are subject to prior sale, change or withdrawal. Neither listing
          broker(s) nor Arizona Regional Multiple Listing Service shall be responsible for any typographical
          errors, misinformation, misprints and shall be held totally harmless. Last updated: {lastUpdated}.
        </p>
        <p>
          The current mortgage interest rate data is from a third-party provider. Deal Landers Arizona Realty
          takes no responsibility for the accuracy of this data. Rates are subject to change at any time and may
          not reflect current rates. Please check with your lender for the most current rates. The rates displayed
          are for informational purposes only and do not constitute an offer to lend. Actual rates may vary based
          on your creditworthiness, loan amount, and other factors.
        </p>
      </div>
    </>
  );
};
