import { BskyAgent } from '@atproto/api';

export const agent = new BskyAgent({
  service: 'https://bsky.social',
});

export interface Post {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    embed?: {
      images?: Array<{
        alt: string;
        image: {
          ref: { $link: string };
          mimeType: string;
        };
      }>;
    };
  };
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
}

export async function fetchPosts(query?: string): Promise<Post[]> {
  try {
    // Login with service account (optional)
    // await agent.login({
    //   identifier: process.env.BLUESKY_IDENTIFIER!,
    //   password: process.env.BLUESKY_PASSWORD!,
    // });

    // Get timeline
    const response = await agent.getTimeline({ limit: 20 });
    
    // Filter posts if query is provided
    const posts = response.data.feed
      .map(item => ({
        uri: item.post.uri,
        cid: item.post.cid,
        author: {
          did: item.post.author.did,
          handle: item.post.author.handle,
          displayName: item.post.author.displayName,
          avatar: item.post.author.avatar,
        },
        record: item.post.record,
        replyCount: item.post.replyCount,
        repostCount: item.post.repostCount,
        likeCount: item.post.likeCount,
        indexedAt: item.post.indexedAt,
      }))
      .filter(post => 
        !query || 
        post.record.text.toLowerCase().includes(query.toLowerCase()) ||
        post.author.handle.toLowerCase().includes(query.toLowerCase()) ||
        (post.author.displayName && post.author.displayName.toLowerCase().includes(query.toLowerCase()))
      );

    return posts;
  } catch (error) {
    console.error('Error fetching Bluesky posts:', error);
    return [];
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
