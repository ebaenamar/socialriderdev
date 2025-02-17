'use client';

import React, { useEffect, useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { ChartBarIcon, ClockIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function WellnessProfile() {
  const { preferences, updatePreferences } = usePreferences();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [scrollCount, setScrollCount] = useState(0);
  const [rapidScrollThreshold] = useState(10); // Lower threshold for testing
  const [lateNightUsage, setLateNightUsage] = useState(false);

  useEffect(() => {
    // Track session start time
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }

    // Track rapid scrolling
    const handleScroll = () => {
      setScrollCount(prev => prev + 1);
    };

    // Check for late night usage (between 11 PM and 5 AM)
    const checkLateNightUsage = () => {
      const currentHour = new Date().getHours();
      setLateNightUsage(currentHour >= 23 || currentHour < 5);
    };

    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    const lateNightInterval = setInterval(checkLateNightUsage, 10000); // Check every 10 seconds

    // Update engagement patterns every 10 seconds
    const updateInterval = setInterval(() => {
      if (sessionStartTime) {
        const timeSpent = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000); // in minutes
        const scrollsPerMinute = timeSpent > 0 ? scrollCount / timeSpent : 0;
        const rapidScrolling = scrollsPerMinute > rapidScrollThreshold;

        updatePreferences({
          wellnessProfile: {
            ...preferences.wellnessProfile,
            engagementPatterns: {
              ...preferences.wellnessProfile.engagementPatterns,
              timeSpent,
              rapidScrolling,
              lateNightUsage,
            }
          }
        });
      }
    }, 10000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(updateInterval);
      clearInterval(lateNightInterval);
    };
  }, [sessionStartTime, scrollCount, lateNightUsage, preferences.wellnessProfile, rapidScrollThreshold, updatePreferences]);

  const getEngagementStatus = () => {
    const patterns = preferences.wellnessProfile?.engagementPatterns;
    if (!patterns) return false;

    return (
      patterns.rapidScrolling ||
      patterns.lateNightUsage ||
      patterns.timeSpent > 1
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Wellness Profile</h2>
        {getEngagementStatus() && (
          <div className="flex items-center text-amber-500">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <span className="text-sm font-medium">High Engagement Detected</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
          <div className="flex items-center mb-3">
            <ClockIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Time Spent</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            {preferences.wellnessProfile?.engagementPatterns?.timeSpent || 0} min
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
          <div className="flex items-center mb-3">
            <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Scroll Activity</h3>
          </div>
          <p className={`text-2xl font-bold ${preferences.wellnessProfile?.engagementPatterns?.rapidScrolling ? 'text-amber-500' : 'text-indigo-600'}`}>
            {preferences.wellnessProfile?.engagementPatterns?.rapidScrolling ? 'High' : 'Normal'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
          <div className="flex items-center mb-3">
            <SparklesIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Usage Pattern</h3>
          </div>
          <p className={`text-2xl font-bold ${preferences.wellnessProfile?.engagementPatterns?.lateNightUsage ? 'text-amber-500' : 'text-indigo-600'}`}>
            {preferences.wellnessProfile?.engagementPatterns?.lateNightUsage ? 'Late Night' : 'Regular Hours'}
          </p>
        </div>
      </div>

      {getEngagementStatus() && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800">
            We notice you&apos;ve been very engaged with content lately. While we love your enthusiasm,
            remember to take regular breaks and maintain a healthy balance.
          </p>
        </div>
      )}
    </div>
  );
}
