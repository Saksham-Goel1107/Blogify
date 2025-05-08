"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusSquare, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../actions/DarkMode';

const BottomNav = () => {
const { darkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const showOnRoutes = ['/Posts', '/profile','/Posts/create','/profile/likes','/profile/saved'];
  const shouldShow = showOnRoutes.includes(pathname) && session;

  if (!shouldShow) return null;

  return (    <nav className={`fixed bottom-0 left-0 right-0 h-13 ${
      darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
    } backdrop-blur-sm border-t flex items-center justify-around px-6 z-50`}>
      <button
        onClick={() => router.push('/Posts')}
        className={`flex flex-col items-center space-y-1 font-semibold ${
          pathname === '/Posts' 
            ? 'text-blue-500' 
            : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
        } transition-colors`}
      >
        <Home size={24} />
        <span className="text-xs">Home</span>
      </button>

      <button
        onClick={() => router.push('/Posts/create')}
        className={`flex flex-col items-center space-y-1 font-semibold ${
          pathname === '/Posts/create'
            ? 'text-blue-500'
            : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
        } transition-colors`}
      >
        <PlusSquare size={24} />
        <span className="text-xs">Create</span>
      </button>

      <button
        onClick={() => router.push('/profile')}
        className={`flex flex-col items-center space-y-1 font-semibold ${
          pathname === '/profile'
            ? 'text-blue-500'
            : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
        } transition-colors`}
      >
        <User size={24} />
        <span className="text-xs">Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;
