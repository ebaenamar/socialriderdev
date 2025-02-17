'use client';

import { useState } from 'react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery } from '@tanstack/react-query';

import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { usePreferences } from '@/contexts/PreferencesContext';

interface Video {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    description: string;
  };
  aiInsights?: string;
}

interface VideoResponse {
  videos: Video[];
  nextPageToken?: string;
  aiInsights?: string;
}

export default function VideoFeed() {
  const [topic, setTopic] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { preferences } = usePreferences();
  
  const fetchVideos = async ({ pageParam = '' }) => {
    const params = new URLSearchParams({
      pageToken: pageParam,
      topic: topic,
      outOfEchoChamber: preferences.outOfEchoChamber.toString(),
      contentTypes: preferences.contentTypes.join(','),
      activePrompts: JSON.stringify(preferences.customPrompts.filter(p => p.active)),
    });
    const response = await fetch(`/api/videos?${params}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json() as Promise<VideoResponse>;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['videos', topic],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage: VideoResponse) => lastPage.nextPageToken,
    initialPageParam: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTopic(searchInput);
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="text-gray-600">Curating content based on your preferences...</p>
      {preferences.outOfEchoChamber && (
        <p className="text-sm text-indigo-600">Looking for diverse perspectives...</p>
      )}
    </div>
  );
  
  if (isError) return (
    <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
      <div className="text-red-600 mb-2">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-600 font-medium">Error loading videos</p>
      <p className="text-gray-500 text-sm">Please check your connection and try again</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];

  return (
    <div id="feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {allVideos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No videos found matching your criteria</p>
          <p className="text-sm text-gray-400">Try adjusting your search terms or preferences</p>
        </div>
      )}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Active Filters</span>
          </div>
          {preferences.outOfEchoChamber && (
            <span className="text-sm text-indigo-600">
              Echo Chamber Protection: Active
            </span>
          )}
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type 'sad', 'happy', 'motivated' or any topic..."
            className="w-full p-4 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
        </form>
      </div>

      <InfiniteScroll
        dataLength={allVideos.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {allVideos.map((video: Video, index: number) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 opacity-0 animate-fadeIn"
          >
            <div className="relative group">
              <div className="relative w-full h-48">
                <Image
                  src={video.snippet.thumbnails.high.url}
                  alt={video.snippet.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={index < 4}
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 line-clamp-2">{video.snippet.title}</h3>
              <p className="text-gray-600 mb-4">{video.snippet.channelTitle}</p>
              <div className="flex justify-between items-center">
                <a
                  href={`https://www.youtube.com/shorts/${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Watch Short
                </a>
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
