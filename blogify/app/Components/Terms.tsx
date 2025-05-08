import React from 'react'
import { useTheme } from '../actions/DarkMode'

const Terms = () => {
    const {darkMode}=useTheme()
  return (
    <div>
      <div className={`rounded-xl shadow-lg ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } p-4 sm:p-6`}>
                      <h2 className="text-2xl font-bold mb-4">Terms & Privacy</h2>
                      <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                        <h3 className="text-xl font-semibold">Terms of Service</h3>
                        <p>
                          By using Blogify, you agree to these terms and conditions.
                          Please read them carefully before using the platform.
                        </p>
                        <h4 className="mt-4 font-semibold">Content Guidelines</h4>
                        <ul className="list-disc list-inside">
                          <li>Respect intellectual property rights</li>
                          <li>No hate speech or discriminatory content</li>
                          <li>No spamming or misleading content</li>
                          <li>Keep discussions civil and professional</li>
                        </ul>
      
                        <h3 className="mt-6 text-xl font-semibold">Privacy Policy</h3>
                        <p>
                          We take your privacy seriously. Here's how we handle your data:
                        </p>
                        <ul className="list-disc list-inside">
                          <li>We only collect necessary information</li>
                          <li>Your data is encrypted and stored securely</li>
                          <li>We never share your personal information</li>
                          <li>You can request your data deletion anytime</li>
                        </ul>
                      </div>
                    </div>
    </div>
  )
}

export default Terms
