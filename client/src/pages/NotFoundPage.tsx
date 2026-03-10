import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <main>
      <h2>Page not found</h2>
      <p>The URL you requested does not exist.</p>
      <p>
        <Link to="/">Go back home</Link>
      </p>
    </main>
  );
};
