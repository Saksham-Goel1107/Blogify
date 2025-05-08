"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../../actions/DarkMode';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Search, Heart } from 'lucide-react';
import Image from 'next/image';

export default function SavedPosts() {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/posts/saved');
          const data = await response.json();
          if (response.ok) {
            setPosts(data.posts.filter((post: any) => 
              !searchQuery || 
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase())
            ));
          }
        } catch (error) {
          console.error('Error fetching saved posts:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchSavedPosts();
  }, [session?.user?.email, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Saved Posts
        </h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved posts..."
            className={`w-full px-4 py-2 pl-10 rounded-lg ${
              darkMode
                ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
            } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-6">
          {posts.map((post: any) => (
            <div
              key={post._id}
              className={`p-6 rounded-lg ${
                darkMode
                  ? 'bg-gray-800'
                  : 'bg-white'
              } shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Image
                    src={post.author.image || '/default-avatar.png'}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {post.author.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => router.push(`/Posts/${post.slug}`)}
                className="cursor-pointer"
              >
                <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {post.title}
                </h2>
                <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {post.content}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={14} className={darkMode ? 'text-red-400' : 'text-red-500'} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {post.likes?.length || 0}
                  </span>
                </span>
                <button
                  onClick={() => {
                    const text = `Check out this post: ${post.title}`;
                    const url = `${window.location.origin}/Posts/${post.slug}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`);
                  }}
                  className={`ml-auto text-sm ${
                    darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  Share on WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>You haven't saved any posts yet.</p>
          <button
            onClick={() => router.push('/Posts')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse posts
          </button>
        </div>
      )}
    </div>
  );
}
