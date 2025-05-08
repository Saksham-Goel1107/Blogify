"use client";

import { useTheme } from '../actions/DarkMode';
import Image from 'next/image';

export default function AboutPage() {
  const { darkMode } = useTheme();
  
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <h1 className="text-4xl font-bold mb-8">About Blogify</h1>
      
      <div className="space-y-8">
        <section className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
            Blogify is a platform dedicated to empowering developers and tech enthusiasts to share their knowledge,
            experiences, and insights with the global developer community. We believe in the power of collective
            knowledge and aim to create a space where developers can learn from each other, showcase their expertise,
            and stay updated with the latest in technology.
          </p>
        </section>

        <section className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-medium">For Writers</h3>
              <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
                <li>• Professional publishing platform</li>
                <li>• Rich text editor with code highlighting</li>
                <li>• Article analytics and insights</li>
                <li>• Engagement with readers</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium">For Readers</h3>
              <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
                <li>• Curated technical content</li>
                <li>• Personalized feed</li>
                <li>• Bookmark and save articles</li>
                <li>• Interactive discussions</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-2xl font-semibold mb-4">Our Technology Stack</h2>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-4`}>
            <p>
              Built with modern technologies to ensure the best possible experience:
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Next.js for server-side rendering
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                MongoDB for scalable data storage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                TypeScript for type safety
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Tailwind CSS for modern styling
              </li>
            </ul>
          </div>
        </section>

        <section className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
            We're building more than just a blogging platform - we're creating a community of developers
            who are passionate about sharing knowledge and helping each other grow. Whether you're a
            seasoned developer or just starting your journey, there's a place for you here at Blogify.
          </p>
        </section>
      </div>
    </div>
  );
}
