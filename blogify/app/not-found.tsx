"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "./actions/DarkMode";

function NotFound() {
  const { darkMode } = useTheme();

  return (
    <div className={`not-found-container ${darkMode ? "dark" : ""}`}>
      <div className="not-found-bg" />
      <div className="not-found-content">
        <div className="emoji">🚫</div>
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link className="text-white bg-gradient-to-br from-red-400 to-blue-600 hover:bg-gradient-to-bl focus:outline-none rounded-full text-lg px-5 py-2 cursor-pointer font-bold hover:scale-105" href="/">
          ⬅ Back to Home
        </Link>
      </div>

      <style jsx>{`
        .not-found-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 90vh;
          padding: 2rem;
          overflow: hidden;
          font-family: "Segoe UI", "Inter", sans-serif;
          background-color: #f7f9fc;
          color: #222;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        .not-found-container.dark {
          background-color: #121212;
          color: #e0e0e0;
        }

        .not-found-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(-45deg, #3a36db, #6a61f5, #c2c2f0, #3a36db);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
          opacity: 0.07;
          z-index: 0;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .not-found-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 600px;
          padding: 3rem;
          background-color: #ffffff;
          border-radius: 1rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .not-found-container.dark .not-found-content {
          background-color: #1e1e1e;
          box-shadow: 0 20px 50px rgba(255, 255, 255, 0.05);
        }

        .emoji {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-code {
          font-size: 6rem;
          font-weight: 900;
          color: #3a36db;
          margin: 0;
        }

        .not-found-container.dark .error-code {
          color: #9fa8ff;
        }

        .error-title {
          font-size: 2rem;
          margin: 0.5rem 0 1rem;
        }

        .error-message {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .not-found-container.dark .error-message {
          color: #aaa;
        }
     

        @media (max-width: 480px) {
          .error-code {
            font-size: 4.5rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-message {
            font-size: 1rem;
          }

          .not-found-content {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NotFound;
