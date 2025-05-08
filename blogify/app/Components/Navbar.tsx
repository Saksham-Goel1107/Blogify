"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faTimes,
  faBars,
  faPhone,
  faEnvelope,
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../actions/DarkMode";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showdropdown, setShowdropdown] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      if (
        showdropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowdropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, showdropdown]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          const data = await response.json();
          if (data.user) {
            setUserData(data.user);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };
    fetchUserData();
  }, [session]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const handleLogout = () => {
    setShowLogoutModal(true);
    setMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    signOut({ callbackUrl: '/' });
    setShowLogoutModal(false);
    
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 p-3 rounded-lg max-w-[90vw] mx-auto transition-all duration-300 ${
        scrolled
          ? `bg-transparent backdrop-blur-md ${
              darkMode ? "bg-opacity-80" : "bg-white/20"
            } shadow-lg`
          : darkMode
          ? "bg-gray-800 text-white"
          : "bg-gray-200 text-black"
      }`}
    >
      <div
        className={`flex justify-between items-center ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        <Link className="font-extrabold text-lg" href="/">
          Blogify
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="relative" ref={dropdownRef}>
              <button
                id="dropdownHoverButton"
                data-dropdown-toggle="dropdownHover"
                data-dropdown-trigger="hover"
                className={` font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center cursor-pointer ${
                  scrolled
          ? `bg-transparent backdrop-blur-md ${
              darkMode ? "bg-opacity-50" : "bg-white/10"
            } shadow-lg`
          : darkMode
          ? "bg-gray-700 text-white hover:bg-gray-900"
          : "bg-gray-400 text-black hover:bg-gray-500"
      }`}
                type="button"
                onClick={() => setShowdropdown(!showdropdown)}
              >
                {userData?.username || 'New User 😊'}
                <svg
                  className="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              <div
                id="dropdownHover"
                className={`z-10 ${
                  showdropdown ? "" : "hidden"
                } bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 absolute right-0 mt-2 ${
                  darkMode ? "dark:bg-gray-800" : "bg-white"
                }`}
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownHoverButton"
                >
                  <li
                    onClick={() => {
                      router.push("/profile");
                      setShowdropdown(false);
                    }}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  >
                    Your Profile
                  </li>
                  <li>
                    <span
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                      onClick={() => setShowContactModal(true)}
                    >
                      Contact Us
                    </span>
                  </li>
                  <li
                    onClick={() => {
                      setShowLogoutModal(true)
                      setShowdropdown(false);
                    }}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  >
                    Sign out
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-row gap-7 items-center">
            {!session?.user && (
              <Link
                href="/Authlogin"
                className={`relative ${
                  darkMode ? "text-white" : "text-black"
                } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 ${
                  darkMode ? "after:bg-white" : "after:bg-black"
                } after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-3 cursor-pointer font-semibold`}
              >
                Sign In
              </Link>
            )}
            {!session && (
              <span
                onClick={() => setShowContactModal(true)}
                className={`relative ${
                  darkMode ? "text-white" : "text-black"
                } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 ${
                  darkMode ? "after:bg-white" : "after:bg-black"
                } after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-3 cursor-pointer font-semibold`}
              >
                Contact Us
              </span>
            )}
            <span
              onClick={toggleDarkMode}
              className={`relative ${
                darkMode ? "text-white" : "text-black"
              } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 ${
                darkMode ? "after:bg-white" : "after:bg-black"
              } after:transition-all after:duration-500 hover:after:w-full hover:bg-gray-500 p-3 cursor-pointer font-semibold`}
            >
              {darkMode ? (
                <Image src="/sun.svg" alt="Sun Icon" width={24} height={24} />
              ) : (
                <Image src="/moon.svg" alt="Moon Icon" width={24} height={24} />
              )}
            </span>
          </div>

          {/* Mobile Menu Button */}
          {!session &&
          <div className="md:hidden relative" ref={menuRef}>
            <button
              className={darkMode ? "text-white" : "text-black"}
              onClick={toggleMobileMenu}
            >
              <FontAwesomeIcon
                icon={mobileMenuOpen ? faTimes : faBars}
                size="lg"
                className={`fill-current ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            </button>

            {/* Mobile Menu Content */}
            
            <div
              className={`absolute top-full right-0 mt-2 ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              } rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
                mobileMenuOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-2 invisible"
              } overflow-hidden z-40 w-48`}
            >
               <div className="flex flex-col py-1">
                  <Link
                    href="/"
                    className={`w-full text-left ${
                      darkMode ? "text-white" : "text-gray-800"
                    } pt-2 px-4 hover:bg-gray-700 hover:text-white transition-colors duration-200 cursor-pointer font-semibold`}
                  >
                    Home
                  </Link>
                  </div>
                
              <div className="flex flex-col py-1">
                  <Link
                    href="/Authlogin"
                    className={`w-full text-left ${
                      darkMode ? "text-white" : "text-gray-800"
                    } py-2 px-4 hover:bg-gray-700 hover:text-white transition-colors duration-200 cursor-pointer font-semibold`}
                  >
                    Sign In
                  </Link>
                
                <span
                  onClick={() => {
                    setShowContactModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`${
                    darkMode ? "text-white" : "text-gray-800"
                  } py-2 px-4 hover:bg-gray-700 hover:text-white transition-colors duration-200 cursor-pointer font-semibold`}
                >
                  Contact Us
                </span>
                <span
                  onClick={() => {
                    toggleDarkMode();
                    setMobileMenuOpen(false);
                  }}
                  className={`${
                    darkMode ? "text-white" : "text-gray-800"
                  } py-2 px-4 hover:bg-gray-700 hover:text-white transition-colors duration-200 cursor-pointer`}
                >
                  {darkMode ? (
                    <Image
                      src="/sun.svg"
                      alt="Sun Icon"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <Image
                      src="/moon.svg"
                      alt="Moon Icon"
                      width={24}
                      height={24}
                    />
                  )}
                </span>
              </div>
            </div>
          </div>
            }
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-backdrop">
          <div
            className={`modal-content ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } rounded-lg shadow-xl p-6`}
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
    </nav>
  );
};

export default Navbar;
