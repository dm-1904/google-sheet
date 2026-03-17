import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export const NotFoundPage = () => {
  return (
    <main>
      <SeoHead
        title="Page Not Found | Desert Valley Home Search"
        description="The page you requested could not be found."
        noindex
      />
      <h1>Page not found</h1>
      <p>The URL you requested does not exist.</p>
      <p>
        <Link to="/">Go back home</Link>
      </p>
    </main>
  );
};
