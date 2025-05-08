import type { Metadata } from "next";

const SiteMetadata: Metadata = {
  title: "Blogify – AI-Powered Blogging Platform",
  description:
    "Blogify is a modern blogging platform enhanced with Gemini AI integration and real-time chat features. Discover, write, and interact with intelligent tools that take your content creation to the next level.",
  metadataBase: new URL("https://your-domain.com"), 
  openGraph: {
    title: "Blogify – AI-Powered Blogging Platform",
    description:
      "Experience smarter blogging with Blogify. Use Gemini AI for writing assistance and engage in real-time chats to collaborate or get help instantly.",
    url: "https://your-domain.com",
    siteName: "Blogify",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Blogify – Gemini-powered blogging",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogify – Gemini-Powered Blogging Platform",
    description:
      "A futuristic blogging experience with Gemini AI writing support and real-time chat.",
    images: ["/og-image.png"], 
    creator: "@yourhandle", 
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default SiteMetadata;
