import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const youtube = google.youtube('v3');
const openai = new OpenAI();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');
  const topic = searchParams.get('topic') || '';
  
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      maxResults: 10,
      q: topic,
      type: ['video'],
      videoDuration: 'short',
      pageToken: pageToken || undefined,
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!response.data.items) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Extract video IDs and ensure they are valid strings
    const videoIds = response.data.items
      .map(item => item.id?.videoId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    
    if (videoIds.length === 0) {
      return NextResponse.json({ error: 'No valid video IDs found' }, { status: 404 });
    }

    // Get detailed video information
    const videosDetails = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds,
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!videosDetails.data.items) {
      return NextResponse.json({ error: 'No video details found' }, { status: 404 });
    }

    // Analyze content with OpenAI for better recommendations
    const videoDescriptions = videosDetails.data.items
      .map(item => item.snippet?.description)
      .filter((desc): desc is string => typeof desc === 'string' && desc.length > 0);

    const aiAnalysis = await openai.chat.completions.create({
      messages: [{
        role: 'system',
        content: videoDescriptions.length > 0
          ? `Analyze these video descriptions and rate their diversity of perspective and educational value: ${videoDescriptions.join('\n')}`
          : 'No video descriptions available for analysis.'
      }],
      model: 'gpt-3.5-turbo',
    });

    return NextResponse.json({
      videos: videosDetails.data.items,
      nextPageToken: response.data.nextPageToken,
      aiInsights: aiAnalysis.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
