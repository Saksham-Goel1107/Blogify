"use client";
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../actions/DarkMode';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faSpinner, faPen, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import ProfileNav from '../Components/ProfileNav';

const PREDEFINED_INTERESTS = [
  'Web Development',
  'Mobile Development',
  'AI/ML',
  'Data Science',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX Design',
  'Game Development',
  'Blockchain',
  'IoT',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'Software Architecture'
];

interface UserData {
  username: string;
  email: string;
  profilepic: string;
  bio: string;
  interests: string[];
  hasSetUsername: boolean;
  image?: string; 
}

interface TabContent {
  profile: string;
  about: string;
  terms: string;
  posts: number[];
  saved: number[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get('setup') === 'true';

  // All useState hooks
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingSavedPosts, setIsLoadingSavedPosts] = useState(false);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [filteredInterests, setFilteredInterests] = useState<string[]>(PREDEFINED_INTERESTS);
  const [searchInterest, setSearchInterest] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const [savedState, setSavedState] = useState<{
    username: string;
    bio: string;
    interests: string[];
  } | null>(null);

  // All useRef hooks
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication check effect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Authlogin');
    }
  }, [status, router]);

  // Fetch user data effect
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserData();
    }
  }, [session?.user?.email, isSetupMode, status]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // No session state
  if (!session) {
    return null;
  }
  const fetchUserData = async () => {
    if (status === 'authenticated' && session?.user?.email) {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/Authlogin');
            return;
          }
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
          setUsername(data.user.username || '');
          setBio(data.user.bio || '');
          setInterests(data.user.interests || []);
          
          if (isSetupMode && !data.user.hasSetUsername) {
            setIsEditing(true);
          }

          // Fetch user's posts
          setIsLoadingPosts(true);
          try {
            const postsRes = await fetch('/api/posts/user');
            const postsData = await postsRes.json();
            if (postsData.success) {
              setPosts(postsData.posts);
            } else {
              console.error('Failed to fetch posts:', postsData.error);
            }
          } catch (error) {
            console.error('Error fetching posts:', error);
          } finally {
            setIsLoadingPosts(false);
          }

          // Fetch saved posts
          setIsLoadingSavedPosts(true);
          try {
            const savedPostsRes = await fetch('/api/posts/saved');
            const savedPostsData = await savedPostsRes.json();
            if (savedPostsRes.ok) {
              setSavedPosts(savedPostsData.posts || []);
            }
          } catch (error) {
            console.error('Error fetching saved posts:', error);
          } finally {
            setIsLoadingSavedPosts(false);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setSuccess('');
    setIsUploading(true);

    try {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setSuccess('Profile photo updated successfully');
      // Refresh user data
      await fetchUserData();
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          bio,
          interests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      // Refresh user data
      await fetchUserData();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleRemoveImage = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeProfilePic: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove profile picture');
      }

      setSuccess('Profile picture removed successfully');
      setPreviewUrl(null);
      // Refresh user data
      await fetchUserData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove profile picture');
    }
  };

  const removeInterest = (interest: string): void => {
    setInterests(interests.filter((i: string) => i !== interest));
  };

  const handleInterestSearch = (search: string): void => {
    setSearchInterest(search);
    setFilteredInterests(
      PREDEFINED_INTERESTS.filter((interest: string) => 
        interest.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const toggleInterest = (interest: string): void => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i: string) => i !== interest));
    } else if (interests.length < 5) {
      setInterests([...interests, interest]);
    } else {
      setError('You can select up to 5 interests');
    }
  };

  const handleStartEditing = () => {
    setSavedState({
      username,
      bio,
      interests: [...interests]
    });
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (savedState) {
      setUsername(savedState.username);
      setBio(savedState.bio);
      setInterests(savedState.interests);
    }
    setIsEditing(false);
    setSavedState(null);
    setError('');
  };
  return (
    <div className="min-h-screen pt-20 px-2 sm:px-4">
      <div className={`max-w-7xl mx-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Profile Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Navigation Sidebar - Fixed on desktop, collapsible on mobile */}
          <div className="lg:w-64 flex-shrink-0">
            <ProfileNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content Area - Responsive width */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className={`rounded-xl shadow-lg ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } p-4 sm:p-6`}>
                {error && (
                  <div className="mb-4 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 text-center">
                    <p className="text-green-500 text-sm">{success}</p>
                  </div>
                )}

                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                          darkMode ? 'border-gray-800' : 'border-white'
                        } relative`}>
                          {(previewUrl || userData?.profilepic) ? (
                            <Image
                              src={previewUrl || userData?.profilepic || '/default-avatar.png'}
                              alt={`${userData?.username || 'User'}'s profile picture`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <FontAwesomeIcon icon={faUser} className="text-3xl text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 right-0 flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 rounded-full ${
                              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                            } transition-colors duration-200`}
                            disabled={isUploading}
                            title="Upload new image"
                          >
                            {isUploading ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faCamera} />
                            )}
                          </button>
                          {(previewUrl || userData?.profilepic) && userData?.profilepic !== '/default-avatar.png' && (
                            <button
                              onClick={handleRemoveImage}
                              className={`p-2 rounded-full ${
                                darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                              } text-white transition-colors duration-200`}
                              title="Remove image"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{username || 'New User'}</h2>
                        <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {bio || 'No bio yet'}
                        </p>
                      </div>
                    </div>
                    {!isSetupMode && !isEditing && (
                      <button
                        onClick={handleStartEditing}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          darkMode 
                            ? 'bg-gray-500 hover:bg-gray-600' 
                            : 'bg-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        <FontAwesomeIcon icon={faPen} />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <label className="block text-sm font-medium mb-2">
                        Username 
                        {!userData?.hasSetUsername && (
                          <span className="text-red-500 ml-1">* Required - Can only be set once</span>
                        )}
                      </label>
                      {(isEditing || isSetupMode) && !userData?.hasSetUsername ? (
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg ${
                            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                          } border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all`}
                          minLength={3}
                          maxLength={30}
                          placeholder="Choose your username carefully - can't be changed later"
                          required
                        />
                      ) : (
                        <p className={`px-4 py-3 rounded-lg ${
                          darkMode ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          {username || 'No username set'}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium mb-2">
                        Bio <span className="text-sm text-gray-500">(minimum 10 characters)</span>
                      </label>
                      {(isEditing || isSetupMode) ? (
                        <div>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg ${
                              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                            } border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
                            rows={4}
                            minLength={10}
                            maxLength={500}
                            placeholder="Tell us about yourself (at least 10 characters)"
                          />
                          <span className={`text-sm mt-1 block text-right ${
                            bio.length < 10 ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {bio.length}/500 {bio.length > 0 && bio.length < 10 && '(minimum 10 characters)'}
                          </span>
                        </div>
                      ) : (
                        <p className={`px-4 py-3 rounded-lg ${
                          darkMode ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          {bio || 'No bio yet ask ai for help'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Interests {isEditing && <span className="text-sm text-gray-500">(Select up to 5)</span>}
                      </label>
                      {isEditing && (
                        <div className="mb-4">
                          <input
                            type="text"
                            value={searchInterest}
                            onChange={(e) => handleInterestSearch(e.target.value)}
                            placeholder="Search interests..."
                            className={`w-full px-4 py-3 rounded-lg ${
                              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                            } border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all mb-3`}
                          />
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {filteredInterests.map((interest) => (
                              <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                  interests.includes(interest)
                                    ? darkMode
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-500 text-white'
                                    : darkMode
                                    ? 'bg-gray-600 hover:bg-gray-500'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {interests.length > 0 ? (
                          interests.map((interest, index) => (
                            <span
                              key={index}
                              className={`px-4 py-2 rounded-lg ${
                                darkMode ? 'bg-gray-600' : 'bg-gray-200'
                              } flex items-center gap-2`}
                            >
                              {interest}
                              {isEditing && (
                                <button
                                  onClick={() => toggleInterest(interest)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No interests selected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 space-y-4">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isEditing && bio.length > 0 && bio.length < 10}
                        className={`w-full py-3 rounded-lg text-white font-medium cursor-pointer ${
                          darkMode 
                            ? bio.length > 0 && bio.length < 10 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700' 
                            : bio.length > 0 && bio.length < 10
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600'
                        } transition-colors`}
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}            {activeTab === 'about' && (
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
            )}

            {activeTab === 'terms' && (
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
            )}

            {activeTab === 'posts' && (
              <div className={`rounded-xl shadow-lg ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } p-4 sm:p-6`}>                {isLoadingPosts ? (
                  <div className="flex justify-center items-center py-8">
                    <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid gap-4">
                    {posts.map((post: any) => (
                      <div
                        key={post._id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          darkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => router.push(`/Posts/${post.slug}`)}
                      >
                        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {post.category}
                          </span>
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-${darkMode ? 'gray-400' : 'gray-500'} text-center py-8`}>
                    You haven't created any posts yet
                  </p>
                )}
              </div>
            )}

{activeTab === 'saved' && (
  <div
    className={`rounded-xl shadow-lg ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } p-4 sm:p-6`}
  >
    {isLoadingSavedPosts ? (
      <div className="flex justify-center items-center py-8">
        <FontAwesomeIcon
          icon={faSpinner}
          className="w-6 h-6 animate-spin text-blue-500"
        />
      </div>
    ) : savedPosts.length > 0 ? (
      <div className="grid gap-4">
        {savedPosts.map((post: any) => (
          <div
            key={post._id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => router.push(`/Posts/${post.slug}`)}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              {post.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {post.category}
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Posted by {post.author.name} •{' '}
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500">No saved posts.</p>
    )}
  </div>
                    )}
                    {activeTab === 'settings' && (
  <div className={`rounded-xl shadow-lg ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  } p-4 sm:p-6`}>
    <h2 className="text-2xl font-bold mb-6">Settings</h2>
    
    {/* Appearance Settings */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Appearance</h3>
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>

    {/* Email Preferences */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Email Preferences</h3>
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Receive our weekly newsletter with top stories
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={true} onChange={() => {}} />
              <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Post Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Get notified when someone comments on your posts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={true} onChange={() => {}} />
              <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* Privacy Settings */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Privacy</h3>
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Visibility</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Choose who can see your profile
              </p>
            </div>
            <select 
              className={`px-3 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500 transition-all`}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="followers">Followers Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Email Address</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Display your email on your public profile
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={false} onChange={() => {}} />
              <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* Security Settings */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Security</h3>
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              Enable 2FA
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recent Activity</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View your recent login history
              </p>
            </div>
            <button
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              View Activity
            </button>
          </div>
          <div>
            <button
              className="w-full px-4 py-2 mt-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Account Settings */}
    <div>
      <h3 className="text-xl font-semibold mb-4">Account</h3>
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Export Data</p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Download a copy of your Blogify data
            </p>
            <button
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              Export Data
            </button>
          </div>
          <div>
            <p className="font-medium">Connected Accounts</p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Manage your connected social accounts
            </p>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                Connect GitHub
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                Connect Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div 
            className={`modal-content ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-3xl sm:text-4xl" />
              </div>
              
              <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Delete Account
              </h3>
              <p className={`${darkMode ? 'text-white' : 'text-gray-600'} mb-6`}>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>
              
              <div className="flex justify-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-4 sm:px-6 py-2 border border-gray-300 rounded-md ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 bg-white hover:bg-gray-100'
                  } focus:outline-none transition-colors duration-300 flex items-center cursor-pointer`}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement account deletion
                    setShowDeleteModal(false);
                  }}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
