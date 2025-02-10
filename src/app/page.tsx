'use client';

import { useCallback, useEffect, useState } from 'react';
import { Post, fetchPosts, FeedType, FeedOptions } from '@/lib/bluesky';
import { trackInteraction, analyzeUserPreferences } from '@/lib/ai';
import Feed from '@/components/Feed';
import LoginForm from '@/components/LoginForm';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function HomePage() {
  const gradientBg = 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500';

  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    <div className={`min-h-screen ${gradientBg} ${inter.className}`}>
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 backdrop-blur-md bg-black/10 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Social Rider</h1>
          <p className="text-white/70">Your AI-powered social feed</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8 relative min-h-screen">
        {!isLoggedIn ? (
          <div className="pt-12">
            <LoginForm onSuccess={() => {
              setIsLoggedIn(true);
              loadPosts();
            }} />
          </div>
        ) : (
          <>
            {/* Feed controls */}
            <div className="glass-card p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feed type */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Feed Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('type', 'timeline')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${feedOptions.type === 'timeline' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'popular')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${feedOptions.type === 'popular' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                      Popular
                    </button>
                  </div>
                </div>

                {/* Content types */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Content Types
                  </label>
                  <div className="space-y-2">
                    {['text', 'image', 'video'].map(type => (
                      <label key={type} className="flex items-center text-white/70 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={feedOptions.content.types.includes(type as any)}
                          onChange={(e) => {
                            const types = e.target.checked
                              ? [...feedOptions.content.types, type]
                              : feedOptions.content.types.filter(t => t !== type);
                            handleFilterChange('content', { ...feedOptions.content, types });
                          }}
                          className="mr-2 h-4 w-4 rounded border-white/30 text-purple-500 focus:ring-purple-500"
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Post types */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Post Types
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center text-white/70 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={feedOptions.includeReplies}
                        onChange={(e) => handleFilterChange('includeReplies', e.target.checked)}
                        className="mr-2 h-4 w-4 rounded border-white/30 text-purple-500 focus:ring-purple-500"
                      />
                      Replies
                    </label>
                    <label className="flex items-center text-white/70 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={feedOptions.includeReposts}
                        onChange={(e) => handleFilterChange('includeReposts', e.target.checked)}
                        className="mr-2 h-4 w-4 rounded border-white/30 text-purple-500 focus:ring-purple-500"
                      />
                      Reposts
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            {error ? (
              <div className="text-center py-12 glass-card">
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
                      className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/40">
          <p>Built with Next.js and Bluesky API</p>
        </div>
      </footer>
    </div>
  );
}
