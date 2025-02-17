'use client';

import VideoFeed from '@/components/VideoFeed';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import UserPreferences from '@/components/UserPreferences';
import WellnessProfile from '@/components/WellnessProfile';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Feed<span className="text-purple-600">Flip</span></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#feed" className="text-gray-600 hover:text-indigo-600 transition-colors">Explore</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <Hero />
        <Features />
        <UserPreferences />
        <WellnessProfile />
        <VideoFeed />
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            FeedFlip - Turn your content discovery upside down. Built with AI for genuine social exploration.
          </p>
        </div>
      </footer>
    </div>
  );
}
