import OpenAI from 'openai';

// Initialize OpenAI client with fallback for missing API key
const openai = typeof window === 'undefined' ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Flag to track if we have a valid API key
const hasValidApiKey = typeof window === 'undefined' && !!process.env.OPENAI_API_KEY;

export interface UserInteraction {
  postId: string;
  action: 'like' | 'repost' | 'reply' | 'view' | 'hide' | 'scroll_past';
  duration?: number; // Time spent viewing in milliseconds
  timestamp: number;
}

export interface ContentPreferences {
  topics: {
    interested: string[];
    disinterested: string[];
  };
  contentTypes: {
    preferred: ('text' | 'image' | 'video')[];
    engagement: Record<'text' | 'image' | 'video', number>;
  };
  sentiment: {
    preferred: ('positive' | 'neutral' | 'negative')[];
    engagement: Record<'positive' | 'neutral' | 'negative', number>;
  };
}

/**
 * Creates a prompt for OpenAI analysis based on user interactions
 * @param interactions - Array of user interactions
 * @param posts - Array of posts that were interacted with
 * @returns Formatted prompt string
 */
function createAnalysisPrompt(interactions: UserInteraction[], posts: any[]): string {
  const interactionData = interactions.map(interaction => {
    const post = posts.find(p => p.uri === interaction.postId);
    return {
      ...interaction,
      content: post ? {
        text: post.record.text,
        topics: post.metadata?.topics,
        contentType: post.metadata?.contentType,
        sentiment: post.metadata?.sentiment,
      } : null,
    };
  });

  return `Analyze these user interactions with social media posts and determine their content preferences. Do not include any personal or identifying information in the analysis.

Interactions:
${JSON.stringify(interactionData, null, 2)}

Provide a structured analysis of:
1. Topics they seem interested in
2. Topics they seem to avoid
3. Preferred content types (text, image, video)
4. Sentiment preferences

Format the response as a JSON object matching the ContentPreferences type.`;
}

/**
 * Analyzes user preferences based on their interactions with posts
 * @param interactions - Array of user interactions
 * @param posts - Array of posts that were interacted with
 * @returns Content preferences based on analysis
 */
export async function analyzeUserPreferences(
  interactions: UserInteraction[],
  posts: any[]
): Promise<ContentPreferences> {
  // Return default preferences if no API key is available
  if (!hasValidApiKey || !openai) {
    console.warn('OpenAI API key is missing or running in browser. Using default preferences.');
    return {
      topics: {
        interested: [],
        disinterested: []
      },
      contentTypes: {
        preferred: ['text', 'image', 'video'],
        engagement: { text: 0, image: 0, video: 0 }
      },
      sentiment: {
        preferred: ['neutral'],
        engagement: { positive: 0, neutral: 0, negative: 0 }
      }
    };
  }

  try {
    const prompt = createAnalysisPrompt(interactions, posts);
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    try {
      const result = JSON.parse(content);
      return result as ContentPreferences;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error analyzing preferences:', error);
    return {
      topics: { interested: [], disinterested: [] },
      contentTypes: {
        preferred: [],
        engagement: { text: 0, image: 0, video: 0 },
      },
      sentiment: {
        preferred: [],
        engagement: { positive: 0, neutral: 0, negative: 0 },
      },
    };
  }
}

/**
 * Tracks user interaction with posts in localStorage
 * @param interaction - The interaction to track
 */
export function trackInteraction(interaction: UserInteraction): void {
  try {
    // Store interaction in localStorage
    const interactions = JSON.parse(
      localStorage.getItem('userInteractions') || '[]'
    ) as UserInteraction[];

    // Keep only last 100 interactions to respect privacy and storage
    interactions.push(interaction);
    if (interactions.length > 100) {
      interactions.shift();
    }

    localStorage.setItem('userInteractions', JSON.stringify(interactions));
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}
