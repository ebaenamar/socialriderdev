import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const youtube = google.youtube('v3');
const openai = new OpenAI();

interface AlgorithmPrompt {
  name: string;
  prompt: string;
  active: boolean;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');
  const topic = searchParams.get('topic') || '';
  const outOfEchoChamber = searchParams.get('outOfEchoChamber') === 'true';
  const contentTypes = searchParams.get('contentTypes')?.split(',') || [];
  const activePrompts = JSON.parse(searchParams.get('activePrompts') || '[]') as AlgorithmPrompt[];
  
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

    // Build the AI analysis prompt based on user preferences
    let analysisPrompt = 'Analyze these videos considering:\n';
    
    if (outOfEchoChamber) {
      analysisPrompt += '- Look for content that challenges common viewpoints and presents alternative perspectives\n';
    }
    
    if (contentTypes.length > 0) {
      analysisPrompt += `- Focus on content types: ${contentTypes.join(', ')}\n`;
    }
    
    // Add custom algorithm prompts
    activePrompts.forEach(prompt => {
      analysisPrompt += `- ${prompt.prompt}\n`;
    });
    
    analysisPrompt += `\nVideo descriptions:\n${videoDescriptions.join('\n')}`;

    const aiAnalysis = await openai.chat.completions.create({
      messages: [{
        role: 'system',
        content: analysisPrompt
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
