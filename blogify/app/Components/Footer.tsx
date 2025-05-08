"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faTimes,
  faPhone,
  faEnvelope,
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../actions/DarkMode";
import { useSession, signOut } from "next-auth/react";

const Footer = () => {
  const { darkMode } = useTheme();
  const currentYear = new Date(Date.now()).getFullYear();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  const confirmLogout = () => {
    signOut({ callbackUrl: '/' });
    setShowLogoutModal(false);
  };

  useEffect(() => {
    if (showContactModal || showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showContactModal, showLogoutModal]);
   
  const { data: session } = useSession();

  return (
    <footer
      className={`${darkMode ? "bg-gray-900" : "bg-gray-200"} ${
        darkMode ? "text-white" : "text-gray-800"
      } p-6`}
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand Section */}
        <div>
          <Link href="/" className="font-extrabold text-lg cursor-pointer">
            Blogify
          </Link>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-2`}>
            Share Your Thoughts With The World
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-lg">Quick Links</h4>

          <Link
            href="/"
            className={`w-[4rem] relative ${
              darkMode ? "text-white" : "text-gray-800"
            } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-1 font-semibold`}
          >
            Home
          </Link>

          <Link
            href="/about"
            className={`w-[5rem] relative ${
              darkMode ? "text-white" : "text-gray-800"
            } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-1 font-semibold`}
          >
            About Us
          </Link>

          <Link
            href="/terms"
            className={`w-[10rem] relative ${
              darkMode ? "text-white" : "text-gray-800"
            } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-1 font-semibold`}
          >
            Terms of Use
          </Link>

          {!session && (
            <Link
              href="/Authlogin"
              prefetch={true}
              className={`w-[4rem] relative ${
                darkMode ? "text-white" : "text-gray-800"
              } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-1 font-semibold`}
            >
              Sign In
            </Link>
          )}
          {session && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`w-[5rem] relative inline-block appearance-none text-left
                ${darkMode ? "text-white" : "text-gray-800"} 
                after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 
                after:bg-current after:transition-all after:duration-500 
                hover:after:w-full hover:bg-gray-500 p-1 font-semibold cursor-pointer`}
            >
              Sign Out
            </button>
          )}
          <span
            onClick={() => setShowContactModal(true)}
            className={`w-[4.5rem] relative ${
              darkMode ? "text-white" : "text-gray-800"
            } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-1 font-semibold cursor-pointer`}
          >
            Contact
          </span>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="font-bold text-lg">Follow Us</h4>
          <div className="flex gap-4 mt-2">
            <a
              href="https://github.com/Saksham-Goel1107"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} size="lg" />
            </a>
            <a
              href="https://www.linkedin.com/in/saksham-goel-88b74b33a/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} size="lg" />
            </a>
            <a
              href="https://x.com/Saksham1199805?t=RXSGVWAREq1xlEBRGRBR1g&s=09"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faXTwitter} size="lg" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        className={`text-center ${
          darkMode ? "text-gray-500" : "text-gray-600"
        } mt-6`}
      >
        © {currentYear} Blogify. All rights reserved.
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-backdrop">
          <div 
            className={`modal-content ${darkMode?'bg-gray-800':'bg-white'} rounded-lg shadow-xl p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-3xl sm:text-4xl" />
              </div>
              
              <h3 className={`text-lg sm:text-xl font-bold ${darkMode?'text-white':'text-gray-800'} mb-2`}>Confirm Logout</h3>
              <p className={`${darkMode?'text-white':'text-gray-600'} mb-6`}>Are you sure you want to log out? Your cart items will remain saved.</p>
              
              <div className="flex justify-center space-x-3 sm:space-x-4">
                <button
                  onClick={cancelLogout}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-opacity-10 z-40 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-50 transform transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <a
                  href="https://www.npmjs.com/package/create-app-booster"
                  target="_blank"
                  className="w-20 h-20 mx-auto cursor-pointer"
                >
                  <Image
                    src="/icon.png"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="mx-auto cursor-pointer"
                  />
                </a>
              </div>

              <h3 className="text-xl font-bold mb-4">Contact Us</h3>

              <div className="flex flex-col space-y-3">
                <a
                  href="mailto:sakshamgoel1107@gmail.com"
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-900 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Email Us
                </a>

                <a
                  href="https://github.com/Saksham-Goel1107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faGithub} className="mr-2" />
                  GitHub
                </a>

                <a
                  href="tel:+918882534712"
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Call Us
                </a>

                <button
                  onClick={() => setShowContactModal(false)}
                  className={`px-4 py-2 border border-gray-300 rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  } transition-colors duration-300 cursor-pointer`}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
