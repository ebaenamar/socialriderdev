# FeedFlip 🔄

Flip your content discovery upside down! FeedFlip is an AI-powered social feed curator that helps you break free from recommendation bubbles and discover truly diverse, meaningful content.

## Features

- Infinite scroll feed of YouTube Shorts
- AI-powered content analysis and curation
- Topic-based filtering
- Recommendation system designed to break echo chambers
- Modern, responsive UI with smooth animations

## Deployment Guide

### 1. Prerequisites

Before deploying, you'll need:

1. A YouTube Data API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the YouTube Data API v3
   - Create credentials (API key)
   - Note: Keep track of your quota usage

2. An OpenAI API key:
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Sign up or log in
   - Go to API keys section
   - Create a new API key

3. A GitHub account
4. A Vercel account (sign up at [vercel.com](https://vercel.com))

### 2. Environment Setup

You'll need these environment variables:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deployment Steps

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. Deploy on Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Add your environment variables in the project settings
   - Deploy!

### 4. Post-Deployment

1. Monitor your API usage:
   - Keep track of YouTube API quotas
   - Monitor OpenAI API costs
   - Set up usage alerts if needed

2. Optional Optimizations:
   - Set up caching for API responses
   - Configure regional deployments
   - Add error monitoring

## Installation

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is ready to be deployed on Vercel. Simply:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
