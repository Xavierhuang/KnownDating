import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, User, MessageSquare } from 'lucide-react';

const logoPng = `${import.meta.env.BASE_URL}images/logo.png`;
const logoSvg = `${import.meta.env.BASE_URL}images/logo.svg`;

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/compatibility', icon: MessageSquare, label: 'Questions' },
    { path: '/matches', icon: MessageCircle, label: 'Matches' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-icy-200 z-40 nav-safe-area shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img 
                src={logoPng}
                alt="Known" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback to SVG if PNG doesn't exist
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.png')) {
                    target.src = logoSvg;
                  }
                }}
              />
            </div>
            <span className="text-xl font-bold text-dark">Known</span>
          </div>

          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

