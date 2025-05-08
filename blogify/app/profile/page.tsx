"use client";
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../actions/DarkMode';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faSpinner, faPen, faTimes, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import ProfileNav from '../Components/ProfileNav';
import Terms from "../Components/Terms"
import About from "../Components/About"
import Setting from "../Components/Setting"

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
  _id: string; // Added _id property
  username: string;
  email: string;
  profilepic: string;
  bio: string;
  interests: string[];
  hasSetUsername: boolean;
  image?: string; 
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
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
  const [loading, setloading] = useState(false)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const [savedState, setSavedState] = useState<{
    username: string;
    bio: string;
    interests: string[];
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

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

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
  
      // Redirect to home page after successful deletion
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    }
  };

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!session?.user) {
      router.push('/Authlogin');
      return;
    }

    try {
      setFollowLoading(true);
      const response = await fetch('/api/user/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userData?._id })
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        fetchUserData(); // Refresh user data to update counts
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
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
                        } relative`}>                          {(previewUrl || userData?.profilepic) ? (
                            <Image
                              src={previewUrl || userData?.profilepic || '/default-avatar.png'}
                              alt={`${userData?.username || 'User'}'s profile`}
                              fill
                              className="object-cover"
                              priority
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
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          {username || 'New User'}                          {userData?.isVerified && (
                              <span className="text-blue-500">
                                <Image 
                                  src="/verify.png" 
                                  alt="Verified user badge"
                                  height={30} 
                                  width={30}
                                  title="Verified user"
                                />
                              </span>
                          )}
                        </h2>
                        <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {bio || 'No bio yet'}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                            <button
                                className={`text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                                onClick={() => setShowFollowers(true)}
                            >
                                <span className="font-bold">{userData?.followersCount || 0}</span> followers
                            </button>
                            <button
                                className={`text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                                onClick={() => setShowFollowing(true)}
                            >
                                <span className="font-bold">{userData?.followingCount || 0}</span> following
                            </button>
                        </div>
                        {session?.user?.email !== userData?.email && (
                            <button
                                onClick={handleFollow}
                                disabled={loading}
                                className={`mt-3 px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    isFollowing
                                        ? darkMode 
                                            ? 'bg-gray-600 hover:bg-gray-700'
                                            : 'bg-gray-500 hover:bg-gray-600'
                                        : darkMode 
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                } text-white transition-colors`}
                            >
                                {loading ? (
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                ) : isFollowing ? (
                                    'Unfollow'
                                ) : (
                                    'Follow'
                                )}
                            </button>
                        )}
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
                {/* Delete Account Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className={`mt-4 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none transition-colors duration-300 flex items-center`}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                  Delete Account
                </button>
              </div>
            )}            {activeTab === 'about' && (
              <About/>
            )}

            {activeTab === 'terms' && (
              <Terms/>
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
  <Setting/>
)}
          </div>
        </div>
      </div>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className={`modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Delete Account</h3>
                  <div className="mt-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Are you sure you want to delete your account? This action cannot be undone.
                      All your posts and data will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-300`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Followers Modal */}
      {showFollowersModal && userData?.followers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <button 
              onClick={() => setShowFollowersModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close followers modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="text-xl font-bold mb-4">Followers</h3>
            <div className="space-y-4">
              {userData.followers.map((follower: any) => (
                <div key={follower._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    <Image
                      src={follower.profilepic || '/default-avatar.png'}
                      alt={`${follower.username}'s profile`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {follower.username}
                      {follower.isVerified && (
                        <FontAwesomeIcon 
                          icon={faCheckCircle} 
                          className="text-blue-500 text-sm" 
                          title="Verified user"
                        />
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && userData?.following && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <button 
              onClick={() => setShowFollowingModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close following modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="text-xl font-bold mb-4">Following</h3>
            <div className="space-y-4">
              {userData.following.map((following: any) => (
                <div key={following._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    <Image
                      src={following.profilepic || '/default-avatar.png'}
                      alt={`${following.username}'s profile`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {following.username}
                      {following.isVerified && (
                        <FontAwesomeIcon 
                          icon={faCheckCircle} 
                          className="text-blue-500 text-sm" 
                          title="Verified user"
                        />
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
