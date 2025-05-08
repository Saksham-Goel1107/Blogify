import React from 'react'
import { useTheme } from '../actions/DarkMode'

const About = () => {
    const {darkMode} = useTheme();
  return (
    <div>
      <div className={`rounded-xl shadow-lg ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } p-4 sm:p-6`}>
                      <h2 className="text-2xl font-bold mb-4">About Us</h2>
                      <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                        <p>Welcome to Blogify - where ideas meet innovation!</p>
                        <p className="mt-4">
                          Blogify is a modern blogging platform designed for developers and tech enthusiasts.
                          Share your knowledge, discover new insights, and connect with a community of like-minded individuals.
                        </p>
                        <h3 className="mt-6 text-xl font-semibold">Our Mission</h3>
                        <p className="mt-2">
                          To create an inclusive space where developers can share their experiences,
                          learn from each other, and grow together in the ever-evolving world of technology.
                        </p>
                        <h3 className="mt-6 text-xl font-semibold">Features</h3>
                        <ul className="mt-2 list-disc list-inside">
                          <li>Rich text editing with markdown support</li>
                          <li>Code syntax highlighting</li>
                          <li>AI-powered writing assistance</li>
                          <li>Community interactions and feedback</li>
                          <li>Dark mode support</li>
                        </ul>
                      </div>
                    </div>
    </div>
  )
}

export default About
