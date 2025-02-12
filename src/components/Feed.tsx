'use client';

import { Post } from '@/lib/bluesky';
import Image from 'next/image';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  onInteraction?: (postId: string, action: 'like' | 'repost' | 'view') => void;
}

/**
 * Feed component that displays a list of social media posts
 * @param {FeedProps} props - Component props
 * @returns {JSX.Element} The feed component
 */
export default function Feed({ posts, loading, onInteraction }: FeedProps) {
  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading posts">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/4" />
                <div className="h-4 bg-white/10 rounded w-1/3" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading posts...</span>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-12" role="status">
        <p className="text-gray-400 text-lg">No posts found. Try adjusting your search.</p>
      </div>
    );
  }

  /**
   * Formats the post date in a human-readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.uri}
          className="glass-card overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
          onClick={() => onInteraction?.(post.uri, 'view')}
        >
          <div className="p-6">
            {/* Author information */}
            <div className="flex items-center gap-3">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={`${post.author.handle}'s avatar`}
                  width={48}
                  height={48}
                  className="rounded-full"
                  priority={posts.indexOf(post) < 3} // Prioritize loading first 3 avatars
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white/90 font-medium">
                    {post.author.displayName || post.author.handle}
                  </span>
                  <span className="text-white/60 text-sm">
                    @{post.author.handle}
                  </span>
                </div>
                <time 
                  dateTime={post.record.createdAt}
                  className="text-white/40 text-sm"
                >
                  {formatDate(post.record.createdAt)}
                </time>
              </div>
            </div>

            {/* Post content */}
            <div className="mt-4">
              <p className="text-white/80 whitespace-pre-wrap">{post.record.text}</p>
              
              {/* Image grid */}
              {post.record.embed?.images && post.record.embed.images.length > 0 && (
                <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {post.record.embed.images.map((img, i) => (
                    <div key={i} className="relative aspect-video">
                      <Image
                        src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${post.author.did}&cid=${img.image.ref.$link}`}
                        alt={img.alt || 'Post image'}
                        fill
                        className="rounded-lg object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading={posts.indexOf(post) < 2 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interaction metrics */}
            <div className="mt-4 flex items-center gap-6 text-white/60">
              <button 
                className="flex items-center gap-2 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteraction?.(post.uri, 'reply');
                }}
                aria-label={`${post.replyCount} replies`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.replyCount}</span>
              </button>
              <button 
                className="flex items-center gap-2 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteraction?.(post.uri, 'repost');
                }}
                aria-label={`${post.repostCount} reposts`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{post.repostCount}</span>
              </button>
              <button 
                className="flex items-center gap-2 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteraction?.(post.uri, 'like');
                }}
                aria-label={`${post.likeCount} likes`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likeCount}</span>
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
