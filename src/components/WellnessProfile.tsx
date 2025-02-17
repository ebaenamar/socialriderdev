import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, BoltIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { usePreferences } from '@/contexts/PreferencesContext';

export default function WellnessProfile() {
  const { preferences, updatePreferences } = usePreferences();
  const [expandedSection, setExpandedSection] = useState<string | null>('issues');

  const focusIssues = [
    { id: 'adhd', label: 'ADHD', description: 'Difficulty focusing or managing time' },
    { id: 'depression', label: 'Depression', description: 'Feeling down or lacking motivation' },
    { id: 'anxiety', label: 'Anxiety', description: 'Feeling worried or overwhelmed' },
    { id: 'stress', label: 'Stress', description: 'Dealing with daily pressures' },
  ];

  const approaches = [
    { id: 'gentle', label: 'Gentle', description: 'Soft, encouraging, and supportive' },
    { id: 'direct', label: 'Direct', description: 'Clear, straightforward advice' },
    { id: 'humorous', label: 'Humorous', description: 'Light-hearted and fun approach' },
  ];

  const handleFocusIssueToggle = (issueId: string) => {
    const currentIssues = preferences.wellnessProfile.focusIssues;
    const updatedIssues = currentIssues.includes(issueId)
      ? currentIssues.filter(id => id !== issueId)
      : [...currentIssues, issueId];

    updatePreferences({
      wellnessProfile: {
        ...preferences.wellnessProfile,
        focusIssues: updatedIssues,
      },
    });
  };

  const handleApproachChange = (approach: 'gentle' | 'direct' | 'humorous') => {
    updatePreferences({
      wellnessProfile: {
        ...preferences.wellnessProfile,
        contentPreferences: {
          ...preferences.wellnessProfile.contentPreferences,
          preferredApproach: approach,
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
    >
      <div className="flex items-center space-x-3 mb-6">
        <HeartIcon className="h-6 w-6 text-rose-500" />
        <h2 className="text-xl font-semibold text-gray-900">Wellness Profile</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Let us help you discover content that supports your mental well-being and personal growth.
        Your preferences will be used to curate more meaningful and helpful content.
      </p>

      {/* Focus Issues Section */}
      <div className="mb-8">
        <button
          onClick={() => setExpandedSection(expandedSection === 'issues' ? null : 'issues')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
        >
          <span className="font-medium text-gray-900">Focus Issues</span>
          <span className="text-gray-500">{preferences.wellnessProfile.focusIssues.length} selected</span>
        </button>
        
        {expandedSection === 'issues' && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">What would you like support with?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {focusIssues.map(issue => (
            <label
              key={issue.id}
              className="relative flex items-start p-4 cursor-pointer rounded-lg border-2 hover:border-indigo-500 transition-colors"
              style={{
                borderColor: preferences.wellnessProfile.focusIssues.includes(issue.id)
                  ? '#6366f1'
                  : '#e5e7eb',
              }}
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={preferences.wellnessProfile.focusIssues.includes(issue.id)}
                  onChange={() => handleFocusIssueToggle(issue.id)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3">
                <span className="text-gray-900 font-medium">{issue.label}</span>
                <p className="text-gray-500 text-sm">{issue.description}</p>
              </div>
            </label>
          ))}
        </div>
        )}
      </div>

      {/* Content Approach Section */}
      <div className="mb-8">
        <button
          onClick={() => setExpandedSection(expandedSection === 'approach' ? null : 'approach')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
        >
          <span className="font-medium text-gray-900">Content Approach</span>
          <span className="text-gray-500">{preferences.wellnessProfile.contentPreferences.preferredApproach}</span>
        </button>

        {expandedSection === 'approach' && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">How would you like content to be presented?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approaches.map(approach => (
            <button
              key={approach.id}
              onClick={() => handleApproachChange(approach.id as 'gentle' | 'direct' | 'humorous')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                preferences.wellnessProfile.contentPreferences.preferredApproach === approach.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-500'
              }`}
            >
              <span className="font-medium block mb-1">{approach.label}</span>
              <span className="text-sm text-gray-500">{approach.description}</span>
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Content Preferences Section */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'preferences' ? null : 'preferences')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
        >
          <span className="font-medium text-gray-900">Additional Preferences</span>
          <span className="text-gray-500">
            {Object.values(preferences.wellnessProfile.contentPreferences).filter(Boolean).length - 1} enabled
          </span>
        </button>

        {expandedSection === 'preferences' && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Preferences</h3>
        <div className="space-y-4">
          {[
            {
              id: 'needsMotivational',
              label: 'Motivational Content',
              description: 'Include inspiring success stories and encouragement',
              icon: SparklesIcon,
            },
            {
              id: 'needsMindfulness',
              label: 'Mindfulness Reminders',
              description: 'Include content about staying present and reducing stress',
              icon: HeartIcon,
            },
            {
              id: 'needsProductivity',
              label: 'Productivity Tips',
              description: 'Include practical advice for better focus and organization',
              icon: BoltIcon,
            },
          ].map(pref => (
            <label key={pref.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.wellnessProfile.contentPreferences[pref.id as keyof typeof preferences.wellnessProfile.contentPreferences]}
                onChange={(e) => updatePreferences({
                  wellnessProfile: {
                    ...preferences.wellnessProfile,
                    contentPreferences: {
                      ...preferences.wellnessProfile.contentPreferences,
                      [pref.id]: e.target.checked,
                    },
                  },
                })}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div className="flex items-center space-x-2">
                <pref.icon className="h-5 w-5 text-indigo-500" />
                <div>
                  <span className="font-medium text-gray-900">{pref.label}</span>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
        )}
      </div>
    </motion.div>
  );
}
