import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="font-mono text-blue-400 text-sm tracking-widest">404</p>
        <h1 className="font-display text-4xl font-bold text-white">Page Not Found</h1>
        <p className="text-white/40">This route does not exist.</p>
        <Link
          to="/"
          className="inline-block mt-4 btn-primary text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
