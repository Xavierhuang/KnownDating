import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const logoPng = `${import.meta.env.BASE_URL}images/logo.png`;
const logoSvg = `${import.meta.env.BASE_URL}images/logo.svg`;

export default function Splash() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after a minimum display time
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 1500); // Minimum 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-icy-100 via-white to-icy-200 flex items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Heart className="w-12 h-12 text-white" fill="currentColor" />
          </div>
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-dark mb-2">Known</h1>
          <p className="text-gray-600 text-sm">Where Deep Connections Begin</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

