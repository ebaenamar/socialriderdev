'use client';

import { useCallback, useEffect, useState } from 'react';
import { Post } from '@/lib/bluesky';
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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await fetch(`/api/posts${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const debouncedFetchPosts = useCallback(() => {
    const debounced = debounce(() => fetchPosts(), 1000);
    debounced();
  }, [fetchPosts]);

  useEffect(() => {
    debouncedFetchPosts();
  }, [debouncedFetchPosts]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">SocialRider<span className="text-blue-400">.dev</span></h1>
          <p className="text-lg text-white/60 mb-8">Explore the Bluesky social network</p>
          
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

        {error ? (
          <div className="text-center py-12 glass-card p-6">
            <svg className="h-12 w-12 text-rose-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-rose-400 text-lg font-medium mb-2">{error}</p>
            <p className="text-white/70 text-sm">Please try again later</p>
          </div>
        ) : (
          <Feed posts={posts} loading={loading} />
        )}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">SocialRider<span className="text-blue-400">.dev</span></h1>
          <p className="text-lg text-white/60 mb-8">Explore the Bluesky social network</p>
          
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

        {error ? (
          <div className="text-center py-12 glass-card p-6">
            <svg className="h-12 w-12 text-rose-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-rose-400 text-lg font-medium mb-2">{error}</p>
            <p className="text-white/70 text-sm">Please try again later</p>
          </div>
        ) : (
          <Feed posts={posts} loading={loading} />
        )}
      </div>
      <footer className="py-8 border-t border-white/10 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-white/40">
          <p>Built with Next.js and Bluesky API</p>
        </div>
      </footer>
    </div>
  );
}
