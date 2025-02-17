import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
  
  const fetchVideos = async ({ pageParam = '' }) => {
    const params = new URLSearchParams({
      pageToken: pageParam,
      topic: topic,
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
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (isError) return (
    <div className="flex justify-center items-center min-h-[400px] text-red-600">
      <p>Error loading videos. Please try again later.</p>
    </div>
  );

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];

  return (
    <div id="feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for topics like 'science', 'art', 'technology'..."
            className="w-full p-4 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors"
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
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="relative group">
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                className="w-full h-48 object-cover"
              />
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
          </motion.div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
