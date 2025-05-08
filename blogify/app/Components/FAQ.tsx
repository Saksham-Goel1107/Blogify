"use client"
import React from 'react'
import { useTheme } from "../actions/DarkMode"

const FAQ = () => {
  const { darkMode } = useTheme()

  const containerStyle = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
  const answerStyle = darkMode ? 'text-gray-300' : 'text-gray-600'

  return (
    <div className="w-full max-w-6xl px-4 pt-16 pb-16 mx-auto">
<h2 className={`font-bold text-3xl text-center mb-10 text-white }`}>
  Frequently Asked Questions
</h2>
      <div className="space-y-6">
        <div className={`${containerStyle} rounded-lg p-6`}>
          <h3 className="font-semibold text-lg">How do I create a new blog post?</h3>
          <p className={`${answerStyle} mt-2`}>
            Once you're logged in, go to your dashboard and click on "New Post". You can write your content, add images, and format it using our rich text editor before publishing.
          </p>
        </div>
        <div className={`${containerStyle} rounded-lg p-6`}>
          <h3 className="font-semibold text-lg">Can I schedule posts to publish later?</h3>
          <p className={`${answerStyle} mt-2`}>
            Yes, our platform supports post scheduling. When creating a blog post, select the "Schedule" option and choose a future date and time.
          </p>
        </div>
        <div className={`${containerStyle} rounded-lg p-6`}>
          <h3 className="font-semibold text-lg">Is there support for SEO optimization?</h3>
          <p className={`${answerStyle} mt-2`}>
            Absolutely. You can add custom meta titles, descriptions, and tags for each blog post to help with search engine visibility.
          </p>
        </div>
        <div className={`${containerStyle} rounded-lg p-6`}>
          <h3 className="font-semibold text-lg">Can I customize the look of my blog?</h3>
          <p className={`${answerStyle} mt-2`}>
            Yes, we offer several themes and customization options so you can match your blog’s appearance to your brand or personal style.
          </p>
        </div>
        <div className={`${containerStyle} rounded-lg p-6`}>
          <h3 className="font-semibold text-lg">Is it free to use the platform?</h3>
          <p className={`${answerStyle} mt-2`}>
            We offer a free tier with core features. Premium plans unlock advanced analytics, custom domains, and increased storage.
          </p>
        </div>
        <div className={`${containerStyle} rounded-lg p-6`}>
          <h3 className="font-semibold text-lg">How do I manage comments on my posts?</h3>
          <p className={`${answerStyle} mt-2`}>
            You can enable or disable comments per post and moderate them through your dashboard. We also support third-party comment systems like Disqus.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQ
