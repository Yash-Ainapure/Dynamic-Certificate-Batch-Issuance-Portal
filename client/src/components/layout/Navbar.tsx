import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900 dark:text-gray-100">Dynamic Certificate Portal</Link>
        <div className="flex items-center gap-3">
          <Link to="/projects/new" className="text-sm text-blue-600 hover:underline">New Project</Link>
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  );
}
