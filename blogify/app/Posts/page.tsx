"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PostCard from '../Components/PostCard';
import Image from 'next/image';
import { Search, Filter, User, Hash, FileText, X, Loader2 } from 'lucide-react';
import { useTheme } from '../actions/DarkMode';
import { useClickOutside } from '../hooks/useClickOutside';
import debounce from 'lodash/debounce';

const categories = [
  'AI', 'Web Development', 'Mobile Development', 'DevOps', 
  'Data Science', 'Cybersecurity', 'Blockchain', 'Cloud Computing', 
  'Machine Learning', 'Programming Languages', 'Software Engineering', 'Other'
];

export default function Posts() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchType, setSearchType] = useState<'posts' | 'people' | 'topics'>('posts');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(searchRef, () => setShowSuggestions(false));
  
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
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
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

  const handleSuggestionClick = (suggestion: any) => {
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

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Title Section */}
      <div className="mb-6 text-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Discover Articles
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Find the latest insights, tutorials and discussions from developers around the world
        </p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div ref={searchRef} className="relative max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
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
            </div>
            <button
              type="submit"
              className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                isSearching ? 'opacity-80' : ''
              }`}
              suppressHydrationWarning
              disabled={isSearching}
            >
              <Search size={18} />
              Search
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute z-50 w-full mt-2 rounded-lg shadow-lg border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } overflow-hidden`}>
              {suggestions.map((section, index) => (
                <div key={section.type}>
                  {index > 0 && (
                    <div className={`h-px mx-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  )}
                  <div className="py-2">
                    <div className={`px-4 py-2 text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {section.type}
                    </div>
                    {section.items.length > 0 ? (
                      section.items.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => handleSuggestionClick(item)}
                          className={`w-full px-4 py-2 flex items-center gap-3 text-left ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          {item.type === 'user' && (
                            <>
                              <div className="w-10 h-10 relative rounded-full overflow-hidden border">
                                <Image
                                  src={item.image || '/default-avatar.png'}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-500">{item.subtitle}</div>
                              </div>
                            </>
                          )}
                          {item.type === 'post' && (
                            <>
                              <FileText size={20} className="text-blue-500 flex-shrink-0" />
                              <div>
                                <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-500">in {item.category}</div>
                              </div>
                            </>
                          )}
                          {item.type === 'topic' && (
                            <>
                              <Hash size={20} className="text-green-500 flex-shrink-0" />
                              <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                {item.title}
                              </div>
                            </>
                          )}
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

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
              suppressHydrationWarning
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Active filters display */}
        {(selectedCategory || searchQuery) && (
          <div className={`flex flex-wrap items-center gap-2 p-3 rounded-lg mt-4 ${
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

      {/* Posts Content */}
      {loading && page === 1 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
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
