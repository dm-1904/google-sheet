import { Route, Routes } from 'react-router-dom';
import { BlogIndex } from './pages/BlogIndex';
import { BlogPost } from './pages/BlogPost';

export default function App() {
  return (
    <div style={{ margin: '0 auto', maxWidth: 900, padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <Routes>
        <Route path="/" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </div>
  );
}
