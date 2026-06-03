import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * RootLayout wraps every page with the shared Navbar and Footer.
 * App.tsx renders this around all routes.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
