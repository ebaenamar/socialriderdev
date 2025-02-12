import { NextResponse } from 'next/server';
import { fetchPosts, FetchPostsResult } from '@/lib/bluesky';

/**
 * GET handler for fetching posts with optional search functionality
 * @param request - The incoming HTTP request
 * @returns NextResponse with posts data or error message
 */
export async function GET(request: Request) {
  try {
    // Extract search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Fetch posts with optional search query
    const posts: FetchPostsResult = await fetchPosts({
      query: query || undefined,
      limit: 20
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in posts API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
