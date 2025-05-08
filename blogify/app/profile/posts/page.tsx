"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../../actions/DarkMode';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Search } from 'lucide-react';

export default function MyPosts() {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchPosts = async () => {
      if (session?.user?.email) {
        try {
          const params = new URLSearchParams();
          if (searchQuery) {
            params.append('search', searchQuery);
          }
          params.append('author', session.user.email);
          
          const response = await fetch(`/api/posts?${params.toString()}`);
          const data = await response.json();
          if (response.ok) {
            setPosts(data.posts);
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchPosts();
  }, [session?.user?.email, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          My Posts
        </h1>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your posts..."
            className={`w-full px-4 py-2 pl-10 rounded-lg ${
              darkMode
                ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
            } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} size={18} />
        </form>
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
              onClick={() => router.push(`/Posts/${post.slug}`)}
              className={`p-6 rounded-lg cursor-pointer transition-all hover:scale-[1.01] ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              } shadow-md`}
            >
              <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {post.title}
              </h2>
              <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                  {post.category}
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {post.comments?.length || 0} comments
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {post.likes?.length || 0} likes
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>You haven't created any posts yet.</p>
          <button
            onClick={() => router.push('/Posts/create')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first post
          </button>
        </div>
      )}
    </div>
  );
}
