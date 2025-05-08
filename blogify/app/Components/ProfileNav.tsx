"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../actions/DarkMode';
import { Bookmark, FileText, Settings, User, Info, FileQuestion, Shield } from 'lucide-react';

interface ProfileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileNav({ activeTab, onTabChange }: ProfileNavProps) {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  const navItems = [
    {
      label: 'Profile',
      icon: User,
      id: 'profile'
    },
    {
      label: 'Your Posts',
      icon: FileText,
      id: 'posts'
    },
    
    {
      label: 'Settings',
      icon: Settings,
      id: 'settings'
    },
    {
      label: 'About Us',
      icon: Info,
      id: 'about'
    },
    {
      label: 'Terms & Privacy',
      icon: Shield,
      id: 'terms'
    }
  ];

  const handleNavClick = (navItem: { id: string, label: string }) => {
    onTabChange(navItem.id);
  };

  return (
    <nav className={`flex flex-col space-y-1 w-full md:w-64 p-4 rounded-lg ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all text-left ${
              isActive
                ? `${darkMode ? 'bg-blue-500' : 'bg-blue-50'} ${
                    darkMode ? 'text-white' : 'text-blue-700'
                  }`
                : `${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
            }`}
          >
            <Icon size={20} className={isActive ? 'opacity-100' : 'opacity-70'} />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
