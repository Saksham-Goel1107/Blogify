"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../../actions/DarkMode';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Search, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface Post {
  _id: string;
  title: string;
  content: string;
  slug: string;
  author: {
    _id: string;
    name: string;
    image: string;
  };
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'pdf';
  }>;
  category: string;
  createdAt: string;
  likes: string[];
  comments: any[];
}

export default function MyPosts() {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
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
          {posts.map((post: Post) => (
            <div
              key={post._id}
              className={`p-6 rounded-lg cursor-pointer transition-all ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              } shadow-md`}
            >
              {/* Author Info */}
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src={post.author.image || '/default-avatar.png'}
                  alt={post.author.name || 'Anonymous'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.author.name || 'Anonymous'}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div onClick={() => router.push(`/Posts/${post.slug}`)}>
                <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {post.title}
                </h2>
                
                {/* Media Grid */}
                {post.media && post.media.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 relative">
                    {post.media.slice(0, 2).map((media, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                        {media.type === 'video' ? (
                          <video src={media.url} className="w-full h-full object-cover" />
                        ) : media.type === 'pdf' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Image
                              src="/pdf-icon.png"
                              alt="PDF document"
                              width={48}
                              height={48}
                              className="opacity-70"
                            />
                          </div>
                        ) : (
                          <Image
                            src={media.url}
                            alt={`Post image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {post.media.length > 2 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        +{post.media.length - 2} more
                      </div>
                    )}
                  </div>
                )}
                
                <p className={`mb-4 line-clamp-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {post.content}
                </p>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 text-sm">
                <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                  {post.category}
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!session) {
                      router.push('/Authlogin');
                      return;
                    }
                    try {
                      const res = await fetch(`/api/posts/${post._id}/like`, {
                        method: 'POST'
                      });
                      if (res.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error liking post:', error);
                    }
                  }}
                  className="flex items-center gap-1 group"
                >
                  <Heart
                    size={14}
                    className={post.likes?.includes(session?.user?.email || '')
                      ? 'fill-red-500 text-red-500'
                      : darkMode
                        ? 'text-gray-400 group-hover:text-red-500'
                        : 'text-gray-500 group-hover:text-red-500'
                    }
                  />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {post.likes?.length || 0}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/Posts/${post.slug}#comments`);
                  }}
                  className="flex items-center gap-1 group"
                >
                  <MessageCircle
                    size={14}
                    className={darkMode
                      ? 'text-gray-400 group-hover:text-blue-500'
                      : 'text-gray-500 group-hover:text-blue-500'
                    }
                  />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {post.comments?.length || 0}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
