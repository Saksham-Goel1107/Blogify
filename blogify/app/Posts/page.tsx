"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Filter, User, Hash, FileText, X, Loader2 } from 'lucide-react';
import { useTheme } from '../actions/DarkMode';
import { useClickOutside } from '../hooks/useClickOutside';
import debounce from 'lodash/debounce';
import PostCard from '../Components/PostCard';

// Types
interface FilterButtonProps {
  active: boolean;
  icon: any;
  label: string;
  onClick: () => void;
  darkMode: boolean;
}

interface SearchItem {
  id: string;
  title: string;
  preview?: string;
  category?: string;
  slug?: string;
  subtitle?: string;
  image?: string;
  interests?: string[];
  count?: number;
  type: 'post' | 'user' | 'topic';
  author?: {
    name: string;
    image: string;
  };
}

interface SearchSection {
  type: string;
  items: SearchItem[];
}

// Filter button component
const FilterButton = ({ active, icon: Icon, label, onClick, darkMode }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? darkMode
          ? 'bg-blue-500/20 text-blue-400'
          : 'bg-blue-50 text-blue-600'
        : darkMode
        ? 'hover:bg-gray-700 text-gray-400'
        : 'hover:bg-gray-100 text-gray-600'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default function Posts() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSection[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchType, setSearchType] = useState<'posts' | 'people' | 'topics'>('posts');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(searchRef, () => setShowSuggestions(false));

  // Advanced suggestions UI
  const renderSuggestionContent = (item: SearchItem) => {
    switch (item.type) {
      case 'post':
        return (
          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FileText className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {item.title}
              </div>
              <div className="mt-1 text-sm">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.category}
                </span>
                {item.preview && (
                  <span className={`ml-2 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.preview}
                  </span>
                )}
              </div>
              {item.author && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full overflow-hidden">
                    <Image
                      src={item.author.image || '/default-avatar.png'}
                      alt={item.author.name}
                      width={16}
                      height={16}
                      className="object-cover"
                    />
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.author.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      case 'user':
        return (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={item.image || '/default-avatar.png'}
                alt={item.title}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {item.title}
              </div>
              {item.subtitle && (
                <div className={`mt-1 text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.subtitle}
                </div>
              )}
              {item.interests && item.interests.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.interests.slice(0, 2).map((interest: string) => (
                    <span
                      key={interest}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {interest}
                    </span>
                  ))}
                  {item.interests.length > 2 && (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{item.interests.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 'topic':
        return (
          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Hash className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {item.title}
              </div>
              <div className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.count} posts
              </div>
            </div>
          </div>
        );
    }
  };

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
    fetchPosts(true);
  }, [searchParams]);
  
  // Debounced suggestion fetch
  const debouncedFetchSuggestions = useCallback(
    debounce((query: string) => {
      fetchSuggestions(query);
    }, 300),
    []
  );

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await response.json();
      setSuggestions(data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setIsSearching(true);
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchItem) => {
    switch (suggestion.type) {
      case 'post':
        router.push(`/Posts/${suggestion.slug}`);
        break;
      case 'user':
        router.push(`/profile/${suggestion.id}`);
        break;
      case 'topic':
        setSelectedCategory(suggestion.title);
        setSearchQuery('');
        fetchPosts(true);
        break;
    }
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchPosts(true);
    
    // Update URL with search params
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    const newUrl = `/Posts${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl);
  };

  const handleCategoryChange = (category: string) => {
    const isSelected = category === selectedCategory;
    setSelectedCategory(isSelected ? '' : category);
    
    // Update URL with category param
    const params = new URLSearchParams(searchParams.toString());
    if (!isSelected) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    const newUrl = `/Posts${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl);
    
    setPage(1);
    fetchPosts(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Update URL removing search param
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    const newUrl = `/Posts${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl);
    
    fetchPosts(true);
  };

  const fetchPosts = async (reset = false) => {
    setLoading(true);
    try {
      const newPage = reset ? 1 : page;
      const params = new URLSearchParams();
      params.set('page', newPage.toString());
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPosts(reset ? data.posts : [...posts, ...data.posts]);
        setHasMore(newPage < data.totalPages);
        setPage(newPage + 1);
      } else {
        throw new Error(data.error || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="mb-8 text-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Discover Articles
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Find the latest insights, tutorials and discussions from developers around the world
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div ref={searchRef} className="relative max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <form onSubmit={handleSearch}>
                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isSearching ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Search posts, people, or topics..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className={`w-full pl-10 pr-10 py-3 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-100 focus:bg-gray-700' 
                      : 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50'
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                    suppressHydrationWarning
                  >
                    <X size={18} />
                  </button>
                )}
              </form>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <FilterButton
                active={searchType === 'posts'}
                icon={FileText}
                label="Posts"
                onClick={() => setSearchType('posts')}
                darkMode={darkMode}
              />
              <FilterButton
                active={searchType === 'people'}
                icon={User}
                label="People"
                onClick={() => setSearchType('people')}
                darkMode={darkMode}
              />
              <FilterButton
                active={searchType === 'topics'}
                icon={Hash}
                label="Topics"
                onClick={() => setSearchType('topics')}
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* Enhanced Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute z-50 w-full mt-2 rounded-lg shadow-lg border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } overflow-hidden divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {suggestions.map((section) => (
                <div key={section.type} className="py-2">
                  <div className={`px-4 py-2 text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {section.type}
                  </div>
                  <div>
                    {section.items.length > 0 ? (
                      section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSuggestionClick(item)}
                          className={`w-full px-4 py-3 hover:transition-colors ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          {renderSuggestionContent(item)}
                        </button>
                      ))
                    ) : (
                      <div className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No matches found
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active filters display */}
        {(selectedCategory || searchQuery) && (
          <div className={`flex flex-wrap items-center gap-2 p-3 rounded-lg ${
            darkMode ? 'bg-gray-800/50' : 'bg-gray-100/70'
          }`}>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Active filters:
            </span>
            
            {selectedCategory && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
              }`}>
                Category: {selectedCategory}
                <button 
                  onClick={() => handleCategoryChange(selectedCategory)}
                  className="ml-1 rounded-full hover:bg-blue-200 p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {searchQuery && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-800'
              }`}>
                Search: {searchQuery}
                <button 
                  onClick={clearSearch}
                  className="ml-1 rounded-full hover:bg-purple-200 p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {loading && page === 1 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>
      ) : posts?.length > 0 ? (
        <>
          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => fetchPosts()}
                className={`px-6 py-3 flex items-center gap-2 ${
                  darkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } rounded-lg transition-colors font-medium`}
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-opacity-50 rounded-xl border">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            <Filter className="h-10 w-10" />
          </div>
          <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            No posts found
          </h3>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
            {selectedCategory || searchQuery ? 
              'Try adjusting your search or filter criteria' : 
              'There are currently no posts available. Check back later or be the first to create a post!'}
          </p>
          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                router.push('/Posts');
                fetchPosts(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
