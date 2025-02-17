'use client';

import React from 'react';

export default function WellnessProfile() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Wellness Profile</h2>
      <p className="text-gray-600">
        Your personalized content curation settings will be available soon.
      </p>
    </div>
  );
}
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
    </div>
  );

  return content;
}
