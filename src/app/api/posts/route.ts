import { NextResponse } from 'next/server';
import { fetchPosts } from '@/lib/bluesky';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    const posts = await fetchPosts(query || undefined);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
