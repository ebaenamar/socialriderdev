'use client';

import { useCallback, useEffect, useState } from 'react';
import { Post, fetchPosts, FeedType, FeedOptions } from '@/lib/bluesky';
import { trackInteraction, analyzeUserPreferences } from '@/lib/ai';
import Feed from '@/components/Feed';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function HomePage() {
  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const [feedOptions, setFeedOptions] = useState<FeedOptions>({
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
  });

  // Load posts
  const loadPosts = useCallback(async (append = false) => {
    try {
      setLoading(true);
      const result = await fetchPosts({
        cursor: append ? cursor : undefined,
        ...feedOptions,
      });
      setPosts(prev => append ? [...prev, ...result.posts] : result.posts);
      setCursor(result.cursor);
      setHasMore(!!result.cursor);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [cursor, feedOptions]);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Track interactions
  const handleInteraction = useCallback((postId: string, action: 'like' | 'repost' | 'view') => {
    trackInteraction({
      postId,
      action,
      timestamp: Date.now(),
    });
  }, []);

  // Update feed options
  const handleFilterChange = useCallback((key: keyof FeedOptions, value: any) => {
    setFeedOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white ${inter.className}`}>
      <main className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

        {/* Feed controls */}
        <div className="relative z-10 mb-8 space-y-6">
          <h1 className="text-4xl font-bold text-center mb-2">Social Rider</h1>
          <p className="text-center text-white/70 mb-8">Your AI-powered social feed</p>

          {/* Feed type selector */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button
              onClick={() => handleFilterChange('type', 'timeline')}
              className={`px-4 py-2 rounded-lg ${feedOptions.type === 'timeline' ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => handleFilterChange('type', 'trending')}
              className={`px-4 py-2 rounded-lg ${feedOptions.type === 'trending' ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              Trending
            </button>
          </div>

          {/* Content filters */}
          <div className="flex flex-wrap gap-4 justify-center">
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
          </div>
        </div>

        {/* Main content */}
        {error ? (
          <div className="text-center py-12 glass-card p-6">
            <div className="text-rose-400 text-lg font-medium mb-2">{error}</div>
            <p className="text-white/70 text-sm">Please try again later</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Feed 
              posts={posts} 
              loading={loading} 
              onInteraction={handleInteraction}
            />
            
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
        )}
      </main>

      <footer className="py-8 border-t border-white/10 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-white/40">
          <p>Built with Next.js and Bluesky API</p>
        </div>
      </footer>
    </div>
  );
}
