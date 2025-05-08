"use client";

import { useSession } from 'next-auth/react';
import { useTheme } from '../actions/DarkMode';
import { Feather, BookOpen, Heart, Bookmark } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const pathname = usePathname();

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className={`max-w-6xl mx-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Profile Header - Gradient Banner */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                  darkMode ? 'border-gray-800' : 'border-white'
                } relative`}>
                  <Image
                    src={session?.user?.image || '/default-avatar.png'}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{session?.user?.name || 'Loading...'}</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 border-b border-opacity-20 flex overflow-x-auto">
          <Link
            href="/profile"
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              pathname === '/profile'
                ? darkMode
                  ? 'border-blue-500 text-blue-500'
                  : 'border-blue-600 text-blue-600'
                : darkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Feather size={18} />
            Profile
          </Link>
          <Link
            href="/profile/saved"
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              pathname === '/profile/posts'
                ? darkMode
                  ? 'border-blue-500 text-blue-500'
                  : 'border-blue-600 text-blue-600'
                : darkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            
            <Bookmark size={18} />
            Saved
          </Link>
          <Link
            href="/profile/likes"
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              pathname === '/profile/likes'
                ? darkMode
                  ? 'border-blue-500 text-blue-500'
                  : 'border-blue-600 text-blue-600'
                : darkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart size={18} />
            Likes
          </Link>
        </div>

        {/* Main Content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
