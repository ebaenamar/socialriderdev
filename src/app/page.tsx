'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Post, fetchPosts, FetchPostsResult, FeedType, FeedOptions } from '@/lib/bluesky';
import { trackInteraction, analyzeUserPreferences, type UserInteraction } from '@/lib/ai';
import Feed from '@/components/Feed';

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const defaultFeedOptions: FeedOptions = {
  type: 'timeline',
  includeReplies: true,
  includeReposts: true,
  includeQuotes: true,
  topics: {
    includedTopics: [],
    excludedTopics: [],
  },
  content: {
    types: ['text', 'image', 'video'],
    sentiment: undefined,
  },
  sortBy: 'recent',
};

export default function Home() {
  // State declarations
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const [feedOptions, setFeedOptions] = useState<FeedOptions>(defaultFeedOptions);
  const [customFeedUri, setCustomFeedUri] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [excludeTopicInput, setExcludeTopicInput] = useState('');

  // Refs
  const observerRef = useRef<IntersectionObserver>();
  const postTimers = useRef<Map<string, number>>(new Map());


  useEffect(() => {
    // Set up intersection observer for post visibility tracking
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.id;
          if (entry.isIntersecting) {
            // Post came into view
            postTimers.current.set(postId, Date.now());
          } else {
            // Post went out of view
            const startTime = postTimers.current.get(postId);
            if (startTime) {
              const duration = Date.now() - startTime;
              if (duration > 1000) { // Only track if viewed for more than 1 second
                trackInteraction({
                  postId,
                  action: 'view',
                  duration,
                  timestamp: Date.now(),
                });
              }
              postTimers.current.delete(postId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Analyze preferences every 10 interactions
  useEffect(() => {
    const interactions = JSON.parse(
      localStorage.getItem('userInteractions') || '[]'
    ) as UserInteraction[];

    if (interactions.length > 0 && interactions.length % 10 === 0) {
      analyzeUserPreferences(interactions, posts).then((preferences) => {
        // Subtly update feed options based on preferences
        setFeedOptions(prev => ({
          ...prev,
          topics: {
            includedTopics: [...new Set([...prev.topics!.includedTopics, ...preferences.topics.interested])],
            excludedTopics: [...new Set([...prev.topics!.excludedTopics, ...preferences.topics.disinterested])],
          },
          content: {
            ...prev.content!,
            types: preferences.contentTypes.preferred.length > 0 
              ? preferences.contentTypes.preferred 
              : prev.content!.types,
          },
        }));
      });
    }
  }, [posts]);

  const handlePostInteraction = (postId: string, action: UserInteraction['action']) => {
    trackInteraction({
      postId,
      action,
      timestamp: Date.now(),
    });
  };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const [feedOptions, setFeedOptions] = useState<FeedOptions>(defaultFeedOptions);
  const [customFeedUri, setCustomFeedUri] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [excludeTopicInput, setExcludeTopicInput] = useState('');

  const loadPosts = useCallback(async (isLoadMore: boolean = false) => {
    try {
      setLoading(true);
      setError(undefined);

      const result = await fetchPosts({
        cursor: isLoadMore ? cursor : undefined,
        limit: 20,
        query: searchQuery,
        feed: feedOptions.type === 'custom' 
          ? { ...feedOptions, customFeedUri } 
          : feedOptions,
      });

      setPosts(prev => isLoadMore ? [...prev, ...result.posts] : result.posts);
      setCursor(result.cursor);
      setHasMore(!!result.cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [cursor, searchQuery]);

  const debouncedLoadPosts = useCallback(
    debounce(() => loadPosts(false), 500),
    [loadPosts]
  );

  useEffect(() => {
    debouncedLoadPosts();
  }, [searchQuery, debouncedLoadPosts]);

  const handleFeedTypeChange = (type: FeedType) => {
    setFeedOptions(prev => ({ ...prev, type }));
    setPosts([]);
    setCursor(undefined);
    setHasMore(true);
  };

  const handleFilterChange = (key: keyof FeedOptions, value: boolean) => {
    setFeedOptions(prev => ({ ...prev, [key]: value }));
    setPosts([]);
    setCursor(undefined);
    setHasMore(true);
  };

  const handleAddTopic = (type: 'include' | 'exclude') => {
    const topic = type === 'include' ? topicInput : excludeTopicInput;
    if (!topic) return;

    setFeedOptions(prev => ({
      ...prev,
      topics: {
        ...prev.topics!,
        [type === 'include' ? 'includedTopics' : 'excludedTopics']: [
          ...prev.topics![type === 'include' ? 'includedTopics' : 'excludedTopics'],
          topic,
        ],
      },
    }));

    if (type === 'include') {
      setTopicInput('');
    } else {
      setExcludeTopicInput('');
    }
  };

  const handleRemoveTopic = (topic: string, type: 'include' | 'exclude') => {
    setFeedOptions(prev => ({
      ...prev,
      topics: {
        ...prev.topics!,
        [type === 'include' ? 'includedTopics' : 'excludedTopics']: 
          prev.topics![type === 'include' ? 'includedTopics' : 'excludedTopics'].filter(t => t !== topic),
      },
    }));
  };

  const handleContentTypeToggle = (type: ContentType) => {
    setFeedOptions(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        types: prev.content!.types.includes(type)
          ? prev.content!.types.filter(t => t !== type)
          : [...prev.content!.types, type],
      },
    }));
  };

  const renderMainContent = () => {
    if (error) {
      return (
        <div className="text-center py-12 glass-card p-6">
          <svg className="h-12 w-12 text-rose-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-rose-400 text-lg font-medium mb-2">{error}</p>
          <p className="text-white/70 text-sm">Please try again later</p>
        </div>
      );
    }

    return (
      <div>
        <Feed posts={posts} loading={loading} />
        
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => loadPosts(true)}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="mb-12 text-center relative z-10">
          <div className="inline-block">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 filter drop-shadow-lg">
              SocialRider<span className="text-blue-400">.dev</span>
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>
          </div>
          <p className="text-xl text-white/80 mt-6 mb-4 max-w-2xl mx-auto leading-relaxed">
            Discover content that sparks joy and fuels your growth. Your feed, your journey.
          </p>
          
          {/* Smart Filtering Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="col-span-2 text-center mb-6">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Personalize Your Experience
              </h2>
              <p className="text-white/60 mt-2">
                Your preferences are automatically learned as you browse
              </p>
            </div>
            {/* Topics Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">Topics</h3>
              
              {/* Include Topics */}
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Include Topics</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic('include')}
                    placeholder="Enter topic (e.g., tech, AI)"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/40"
                  />
                  <button
                    onClick={() => handleAddTopic('include')}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {feedOptions.topics?.includedTopics.map(topic => (
                    <span key={topic} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      {topic}
                      <button
                        onClick={() => handleRemoveTopic(topic, 'include')}
                        className="ml-2 text-blue-300 hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Exclude Topics */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Exclude Topics</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={excludeTopicInput}
                    onChange={(e) => setExcludeTopicInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic('exclude')}
                    placeholder="Enter topic to exclude"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/40"
                  />
                  <button
                    onClick={() => handleAddTopic('exclude')}
                    className="px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:bg-rose-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {feedOptions.topics?.excludedTopics.map(topic => (
                    <span key={topic} className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/20 text-rose-300">
                      {topic}
                      <button
                        onClick={() => handleRemoveTopic(topic, 'exclude')}
                        className="ml-2 text-rose-300 hover:text-rose-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Filters Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 hover:border-white/20 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">Content Filters</h3>
              
              {/* Content Type */}
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">Content Type</label>
                <div className="flex gap-3">
                  {(['text', 'image', 'video'] as ContentType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => handleContentTypeToggle(type)}
                      className={`px-4 py-2 rounded-lg transition-colors ${feedOptions.content?.types.includes(type) ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">Sentiment</label>
                <div className="flex gap-3">
                  {(['positive', 'neutral', 'negative'] as SentimentType[]).map(sentiment => (
                    <button
                      key={sentiment}
                      onClick={() => setFeedOptions(prev => ({
                        ...prev,
                        content: { ...prev.content!, sentiment: prev.content?.sentiment === sentiment ? undefined : sentiment },
                      }))}
                      className={`px-4 py-2 rounded-lg transition-colors ${feedOptions.content?.sentiment === sentiment ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                    >
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Sort By</label>
                <div className="flex gap-3">
                  {(['recent', 'likes', 'replies', 'reposts'] as SortType[]).map(sort => (
                    <button
                      key={sort}
                      onClick={() => setFeedOptions(prev => ({ ...prev, sortBy: sort }))}
                      className={`px-4 py-2 rounded-lg transition-colors ${feedOptions.sortBy === sort ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feed Type Selection */}
          <div className="flex justify-center gap-4 mb-6 relative z-10">
            <div className="p-1 bg-white/10 backdrop-blur-md rounded-xl inline-flex gap-2">
            <button
              onClick={() => handleFeedTypeChange('timeline')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${feedOptions.type === 'timeline' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => handleFeedTypeChange('popular')}
              className={`px-4 py-2 rounded-lg transition-colors ${feedOptions.type === 'popular' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              Popular
            </button>
            <button
              onClick={() => handleFeedTypeChange('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${feedOptions.type === 'custom' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              Custom Feed
            </button>
          </div>

          {/* Custom Feed URI Input */}
          {feedOptions.type === 'custom' && (
            <div className="max-w-xl mx-auto mb-6">
              <input
                type="text"
                placeholder="Enter custom feed URI (at://...)" 
                value={customFeedUri}
                onChange={(e) => setCustomFeedUri(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/40 mb-4"
              />
            </div>
          )}

          {/* Feed Filters */}
          <div className="flex justify-center gap-4 mb-6">
            <label className="flex items-center gap-2 text-white/70">
              <input
                type="checkbox"
                checked={feedOptions.includeReplies}
                onChange={(e) => handleFilterChange('includeReplies', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-white/30 bg-white/5"
              />
              Replies
            </label>
            <label className="flex items-center gap-2 text-white/70">
              <input
                type="checkbox"
                checked={feedOptions.includeReposts}
                onChange={(e) => handleFilterChange('includeReposts', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-white/30 bg-white/5"
              />
              Reposts
            </label>
            <label className="flex items-center gap-2 text-white/70">
              <input
                type="checkbox"
                checked={feedOptions.includeQuotes}
                onChange={(e) => handleFilterChange('includeQuotes', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-white/30 bg-white/5"
              />
              Quotes
            </label>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/40"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {renderMainContent()}
      </div>
      <footer className="py-8 border-t border-white/10 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-white/40">
          <p>Built with Next.js and Bluesky API</p>
        </div>
      </footer>
    </div>
  );
  return renderContent();
}
