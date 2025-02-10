import { BskyAgent, AtpSessionEvent, AtpSessionData } from '@atproto/api';

export const agent = new BskyAgent({
  service: 'https://bsky.social',
  persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    // You can persist the session data in localStorage or another storage
    if (evt === 'create' || evt === 'update') {
      if (typeof window !== 'undefined' && sess) {
        localStorage.setItem('bsky-session', JSON.stringify(sess));
      }
    } else if (evt === 'expired' || evt === 'create-failed') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bsky-session');
      }
    }
  },
});

// Initialize session from storage if available
if (typeof window !== 'undefined') {
  const storedSession = localStorage.getItem('bsky-session');
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession);
      agent.resumeSession(session);
    } catch (error) {
      console.error('Error resuming Bluesky session:', error);
      localStorage.removeItem('bsky-session');
    }
  }
}

export type PostRecord = {
  text: string;
  createdAt: string;
  langs?: string[];
  embed?: {
    images?: Array<{
      alt: string;
      image: { ref: { $link: string }; mimeType: string };
    }>;
    media?: {
      type: string;
    };
    $type?: string;
  };
};

export interface Post {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName: string | undefined;
    avatar: string | undefined;
  };
  record: PostRecord;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  isReply: boolean;
  isRepost: boolean;
  isQuote: boolean;
  metadata: {
    contentType: ContentType[];
    sentiment: SentimentType;
    topics: string[];
  };
}

export type FeedType = 'timeline' | 'popular' | 'custom';

export type ContentType = 'text' | 'image' | 'video';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type SortType = 'recent' | 'likes' | 'replies' | 'reposts';

export interface TopicFilter {
  includedTopics: string[];
  excludedTopics: string[];
}

export interface ContentFilter {
  types: ContentType[];
  sentiment?: SentimentType;
}

export interface FeedFilter {
  includeReplies?: boolean;
  includeReposts?: boolean;
  includeQuotes?: boolean;
  languages?: string[];
  topics?: TopicFilter;
  content?: ContentFilter;
  sortBy?: SortType;
}

export interface FeedOptions extends FeedFilter {
  type: FeedType;
  customFeedUri?: string; // For custom feeds
}

export interface FetchPostsOptions {
  cursor?: string;
  limit?: number;
  query?: string;
  feed?: FeedOptions;
}

export interface FetchPostsResult {
  posts: Post[];
  cursor?: string;
}

export async function login(identifier: string, password: string): Promise<boolean> {
  try {
    await agent.login({ identifier, password });
    return true;
  } catch (error) {
    console.error('Error logging into Bluesky:', error);
    return false;
  }
}

export function isLoggedIn(): boolean {
  return agent.session !== undefined;
}

function analyzeSentiment(text: string): SentimentType {
  const positiveWords = ['love', 'great', 'awesome', 'amazing', 'good', 'happy', '❤️', '🎉', '😊'];
  const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'sad', 'angry', '😠', '😢', '💔'];

  const positiveCount = positiveWords.reduce(
    (count, word) => count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0),
    0
  );
  const negativeCount = negativeWords.reduce(
    (count, word) => count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0),
    0
  );

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function extractTopics(text: string): string[] {
  const topics: Set<string> = new Set();

  // Extract hashtags
  const hashtags = text.match(/#[\w-]+/g) || [];
  hashtags.forEach(tag => topics.add(tag.slice(1)));

  // Extract mentioned topics (words starting with capital letters)
  const words = text.split(/\s+/);
  words.forEach(word => {
    if (/^[A-Z][a-z]{2,}/.test(word)) {
      topics.add(word);
    }
  });

  return Array.from(topics);
}

function sortPosts(posts: Post[], sortBy: SortType): Post[] {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime();
      case 'likes':
        return b.likeCount - a.likeCount;
      case 'replies':
        return b.replyCount - a.replyCount;
      case 'reposts':
        return b.repostCount - a.repostCount;
      default:
        return 0;
    }
  });
}

export async function fetchPosts(options: FetchPostsOptions = {}): Promise<FetchPostsResult> {
  try {
    const { cursor, limit = 20, query, feed } = options;
    let response;

    // Get feed based on type
    if (feed?.type === 'popular') {
      response = await agent.app.bsky.feed.getFeed({
        feed: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
        cursor,
        limit,
      });
    } else if (feed?.type === 'custom' && feed.customFeedUri) {
      response = await agent.app.bsky.feed.getFeed({
        feed: feed.customFeedUri,
        cursor,
        limit,
      });
    } else {
      // Default to timeline
      response = await agent.getTimeline({ 
        cursor,
        limit,
      });
    }
    
    // Transform posts with enhanced metadata
    let posts = response.data.feed.map(item => {
      // Type definitions for Bluesky feed items
      type PostRecord = {
        text: string;
        createdAt: string;
        langs?: string[];
        embed?: {
          images?: Array<{
            alt: string;
            image: { ref: { $link: string }; mimeType: string };
          }>;
          media?: {
            type: string;
          };
          $type?: string;
        };
      };

      interface FeedViewPost {
        uri: string;
        cid: string;
        author: {
          did: string;
          handle: string;
          displayName: string | undefined;
          avatar: string | undefined;
        };
        record: PostRecord;
        replyCount: number;
        repostCount: number;
        likeCount: number;
        indexedAt: string;
      }

      interface FeedViewItem {
        post: FeedViewPost;
        reply?: unknown;
        reason?: { $type: string };
      }

      // Cast the feed item and extract the record
      const feedItem = item as unknown as FeedViewItem;
      const record = feedItem.post.record;

      // Process the record
      const hasImages = (record.embed?.images?.length ?? 0) > 0;
      const hasVideo = record.embed?.media?.type === 'video';
      const contentType: ContentType[] = [
        'text',
        ...(hasImages ? ['image'] : []),
        ...(hasVideo ? ['video'] : []),
      ] as ContentType[];

      // Simple sentiment analysis based on keywords
      const text = record.text.toLowerCase();
      const sentiment = analyzeSentiment(text);

      // Extract hashtags and topics
      const topics = extractTopics(text);

      return {
        uri: feedItem.post.uri,
        cid: feedItem.post.cid,
        author: {
          did: feedItem.post.author.did,
          handle: feedItem.post.author.handle,
          displayName: feedItem.post.author.displayName,
          avatar: feedItem.post.author.avatar,
        },
        record: record,
        replyCount: feedItem.post.replyCount,
        repostCount: feedItem.post.repostCount,
        likeCount: feedItem.post.likeCount,
        indexedAt: feedItem.post.indexedAt,
        isReply: !!feedItem.reply,
        isRepost: !!feedItem.reason?.$type?.includes('repost'),
        isQuote: !!(record.embed as any)?.$type?.includes('record'),
        metadata: {
          contentType,
          sentiment,
          topics,
        },
      };
    });

    // Apply enhanced filters
    if (feed) {
      // Basic filters
      if (feed.includeReplies === false) {
        posts = posts.filter(post => !post.isReply);
      }
      if (feed.includeReposts === false) {
        posts = posts.filter(post => !post.isRepost);
      }
      if (feed.includeQuotes === false) {
        posts = posts.filter(post => !post.isQuote);
      }
      if (feed.languages?.length) {
        posts = posts.filter(post => {
          const postLang = post.record.langs?.[0];
          return postLang && feed.languages?.includes(postLang);
        });
      }

      // Topic filters
      if (feed.topics) {
        if (feed.topics.includedTopics.length > 0) {
          posts = posts.filter(post =>
            post.metadata.topics.some(topic =>
              feed.topics!.includedTopics.some(includedTopic =>
                topic.toLowerCase().includes(includedTopic.toLowerCase())
              )
            )
          );
        }
        if (feed.topics.excludedTopics.length > 0) {
          posts = posts.filter(post =>
            !post.metadata.topics.some(topic =>
              feed.topics!.excludedTopics.some(excludedTopic =>
                topic.toLowerCase().includes(excludedTopic.toLowerCase())
              )
            )
          );
        }
      }

      // Content type and sentiment filters
      if (feed.content) {
        if (feed.content.types.length > 0) {
          posts = posts.filter(post =>
            post.metadata.contentType.some(type => feed.content!.types.includes(type))
          );
        }
        if (feed.content.sentiment) {
          posts = posts.filter(post => post.metadata.sentiment === feed.content!.sentiment);
        }
      }

      // Sort posts
      if (feed.sortBy) {
        posts = sortPosts(posts, feed.sortBy);
      }
    }

    // Apply search query
    if (query) {
      posts = posts.filter(post => 
        post.record.text.toLowerCase().includes(query.toLowerCase()) ||
        post.author.handle.toLowerCase().includes(query.toLowerCase()) ||
        (post.author.displayName && post.author.displayName.toLowerCase().includes(query.toLowerCase()))
      );
    }

    return {
      posts,
      cursor: response.data.cursor,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Check if the error is due to an expired session
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bsky-session');
        }
      }
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
    throw new Error('Failed to fetch posts: Unknown error');
  }
}

export async function getPostThread(uri: string, depth: number = 1): Promise<Post[]> {
  try {
    const response = await agent.getPostThread({ uri, depth });
    const thread = response.data.thread;
    
    if (!thread || thread.notFound) {
      return [];
    }

    const posts: Post[] = [];
    if ('post' in thread) {
      posts.push({
        uri: thread.post.uri,
        cid: thread.post.cid,
        author: {
          did: thread.post.author.did,
          handle: thread.post.author.handle,
          displayName: thread.post.author.displayName,
          avatar: thread.post.author.avatar,
        },
        record: thread.post.record,
        replyCount: thread.post.replyCount,
        repostCount: thread.post.repostCount,
        likeCount: thread.post.likeCount,
        indexedAt: thread.post.indexedAt,
      });

      if (thread.replies) {
        thread.replies.forEach(reply => {
          if ('post' in reply) {
            posts.push({
              uri: reply.post.uri,
              cid: reply.post.cid,
              author: {
                did: reply.post.author.did,
                handle: reply.post.author.handle,
                displayName: reply.post.author.displayName,
                avatar: reply.post.author.avatar,
              },
              record: reply.post.record,
              replyCount: reply.post.replyCount,
              repostCount: reply.post.repostCount,
              likeCount: reply.post.likeCount,
              indexedAt: reply.post.indexedAt,
            });
          }
        });
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching post thread:', error);
    return [];
  }
}
