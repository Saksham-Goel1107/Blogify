"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Calendar, Tag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../actions/DarkMode';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: {
    _id: string;
    slug: string;
    title: string;
    content: string;
    category: string;
    media?: { url: string; type: string }[];
    author: {
      _id: string;
      name: string;
      image: string;
      email: string;
    };
    likes: string[];
    comments: any[];
    createdAt: string;
    tags?: string[];
    savedBy?: string[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [isLiked, setIsLiked] = useState(post.likes.includes(userEmail || ''));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState(post.savedBy?.includes(session?.user?.email || ''));
  const [savedCount, setSavedCount] = useState(post.savedBy?.length || 0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!session) {
      router.push('/Authlogin');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async () => {
    if (!session) {
      router.push('/Authlogin');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
        setSavedCount(data.savedBy);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleShare = (platform?: string) => {
  const logo = "📖"; 
const url = `${window.location.origin}/Posts/${post.slug}`;
const text = `${logo} Don't miss this!\n\n📌 "${post.title}"\n\n📝 A fresh read from Blogify.`;
const fullText = `${text}\n\n🔗 Read more: ${url}`;


    if (platform) {
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`);
          break;
        case 'copy':
          navigator.clipboard.writeText(fullText)
            .then(() => {
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 4000);
            })
            .catch(err => console.error('Failed to copy:', err));
          break;
      }
    }
    setShowShareOptions(false);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post click event
    router.push(`/profile?userId=${post.author._id}`);
  };

  return (
    <article className={`rounded-xl overflow-hidden border transition-all hover:shadow-lg ${
  darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
}`} suppressHydrationWarning>
  {/* Author and Menu */}
  <div className="p-4 flex items-center justify-between border-b border-opacity-10">
    <div className="flex items-center space-x-2 cursor-pointer" onClick={handleProfileClick}>      <Image
        src={post.author.image || '/default-avatar.png'}
        alt={`${post.author.name || 'Anonymous'}'s profile picture`}
        width={32}
        height={32}
        className="rounded-full"
        title={`View ${post.author.name || 'Anonymous'}'s profile`}
      />
      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>
        {post.author.name || 'Anonymous'}
      </span>
    </div>

    {session?.user?.email === post.author.email && (
      <button
        className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        onClick={() => router.push(`/Posts/${post.slug}/edit`)}
      >
        <MoreHorizontal size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
      </button>
    )}
  </div>

  {/* Main Post Link */}
  <Link href={`/Posts/${post.slug}`} className="block group">
    {/* Media Preview */}
    {post.media && post.media.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 overflow-hidden max-h-64">
        {post.media.slice(0, 2).map((mediaItem, idx) => (
          <div key={idx} className="relative aspect-[16/9] w-full">
            {mediaItem.type === 'video' ? (
              <video src={mediaItem.url} className="w-full h-full object-cover" controls />            ) : mediaItem.type === 'pdf' ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Image
                  src="/pdf-icon.png"
                  alt={`PDF document for post "${post.title}"`}
                  width={48}
                  height={48}
                  className="opacity-70"
                  title="PDF attachment"
                />
              </div>
            ) : (              <Image
                src={mediaItem.url}
                alt={`Image for post "${post.title}" - ${idx + 1}/${post.media?.length || 0}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                title={`Post media ${idx + 1}`}
              />
            )}
          </div>
        ))}
        {post.media.length > 2 && (
          <div className="relative flex items-center justify-center bg-black/40 text-white font-bold text-sm">
            +{post.media.length - 2} more
          </div>
        )}
      </div>
    ) : (
      <div className={`h-32 w-full ${
        darkMode
          ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20'
          : 'bg-gradient-to-r from-blue-50 to-purple-50'
      }`} />
    )}

    {/* Post Title and Content */}
    <div className="p-4">
      <h2 className={`text-lg sm:text-xl font-semibold group-hover:text-blue-500 transition-colors ${
        darkMode ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {post.title}
      </h2>
      <p className={`line-clamp-3 text-sm mt-1 ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {post.content}
      </p>
    </div>
  </Link>

  {/* Category and Tags */}
  <div className="px-4 pb-3 flex flex-wrap gap-2">
    <Link
      href={`/Posts?category=${post.category}`}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        darkMode
          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
    >
      <Tag size={12} className="mr-1" />
      {post.category}
    </Link>

    {post.tags?.slice(0, 2).map((tag, index) => (
      <Link
        key={index}
        href={`/Posts?tag=${tag}`}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          darkMode
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        #{tag}
      </Link>
    ))}
  </div>

  {/* Interaction Bar */}
  <div className="px-4 py-3 border-t border-opacity-10 flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* Like */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 transition-colors ${
          isLiked
            ? 'text-red-500'
            : darkMode
              ? 'text-gray-400 hover:text-red-500'
              : 'text-gray-500 hover:text-red-500'
        }`}
      >
        <Heart className={isLiked ? 'fill-current' : ''} size={20} />
        <span className="text-sm">{likesCount}</span>
      </button>

      {/* Comments */}
      <Link
        href={`/Posts/${post.slug}#comments`}
        className={`flex items-center gap-1 transition-colors ${
          darkMode
            ? 'text-gray-400 hover:text-blue-500'
            : 'text-gray-500 hover:text-blue-500'
        }`}
      >
        <MessageCircle size={20} />
        <span className="text-sm">{post.comments.length}</span>
      </Link>

      {/* Share */}
      <div className="relative">
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className={`flex items-center gap-1 transition-colors ${
            darkMode
              ? 'text-gray-400 hover:text-green-500'
              : 'text-gray-500 hover:text-green-500'
          }`}
        >
          <Share2 size={20} />
        </button>

        {showShareOptions && (
          <div
            ref={shareMenuRef}
            className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg z-10 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >              <div className="grid grid-cols-1 gap-1 w-36">
              {[
                { platform: 'twitter', label: 'Twitter', icon: '𝕏' },
                { platform: 'facebook', label: 'Facebook', icon: 'f' },
                { platform: 'linkedin', label: 'LinkedIn', icon: 'in' },
                { platform: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                { platform: 'copy', label: copySuccess ? 'Copied!' : 'Copy Link', icon: copySuccess ? '✓' : '🔗' }
              ].map(({ platform, label, icon }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } ${platform === 'copy' && copySuccess ? 'text-green-500' : ''}`}
                  disabled={platform === 'copy' && copySuccess}
                >
                  <span className="w-4 text-center">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Save */}
    <button
      onClick={handleSave}
      className={`transition-colors ${
        isSaved
          ? 'text-yellow-500'
          : darkMode
            ? 'text-gray-400 hover:text-yellow-500'
            : 'text-gray-500 hover:text-yellow-500'
      }`}
      title={isSaved ? 'Saved' : 'Save Post'}
    >
      <Bookmark className={isSaved ? 'fill-current' : ''} size={20} />
    </button>
  </div>
</article>

  );
}
