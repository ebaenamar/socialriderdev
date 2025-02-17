import { useState } from 'react';
import { motion } from 'framer-motion';
import { BeakerIcon, AdjustmentsHorizontalIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface AlgorithmPrompt {
  name: string;
  prompt: string;
  active: boolean;
}

interface UserPreferences {
  outOfEchoChamber: boolean;
  contentTypes: string[];
  customPrompts: AlgorithmPrompt[];
}

const defaultPreferences: UserPreferences = {
  outOfEchoChamber: false,
  contentTypes: ['educational', 'entertainment', 'news'],
  customPrompts: [
    {
      name: 'Diverse Perspectives',
      prompt: 'Find content that presents different viewpoints on the topic',
      active: false
    },
    {
      name: 'Deep Analysis',
      prompt: 'Prioritize content with in-depth analysis and expert insights',
      active: false
    }
  ]
};

export default function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [newPrompt, setNewPrompt] = useState({ name: '', prompt: '' });
  const [showPromptForm, setShowPromptForm] = useState(false);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrompt.name && newPrompt.prompt) {
      setPreferences(prev => ({
        ...prev,
        customPrompts: [...prev.customPrompts, { ...newPrompt, active: true }]
      }));
      setNewPrompt({ name: '', prompt: '' });
      setShowPromptForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design Your Feed</h2>
          <p className="text-gray-600">
            Create your perfect content discovery experience by customizing these settings.
            Your preferences will be saved automatically.
          </p>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Experience</h2>
        
        {/* Echo Chamber Control */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-900">Content Diversity</h3>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={preferences.outOfEchoChamber}
                  onChange={(e) => handlePreferenceChange('outOfEchoChamber', e.target.checked)}
                />
                <div className="w-10 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                <div className={`absolute w-4 h-4 top-1 left-1 bg-white rounded-full transition-transform ${
                  preferences.outOfEchoChamber ? 'translate-x-4' : ''
                }`}></div>
              </div>
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-900">Break out of the echo chamber</span>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, we'll actively look for content that presents different viewpoints
                  and challenges your current perspectives.
                </p>
              </span>
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Enable to discover content that challenges your current perspectives and broadens your horizons.
          </p>
        </div>

        {/* Content Type Preferences */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <AdjustmentsHorizontalIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">Content Types</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['educational', 'entertainment', 'news', 'tutorials', 'discussions', 'creative'].map((type) => (
              <label key={type} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  checked={preferences.contentTypes.includes(type)}
                  onChange={(e) => {
                    const updatedTypes = e.target.checked
                      ? [...preferences.contentTypes, type]
                      : preferences.contentTypes.filter(t => t !== type);
                    handlePreferenceChange('contentTypes', updatedTypes);
                  }}
                />
                <span className="text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Algorithm Prompts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BeakerIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-900">Custom Algorithms</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your own content filtering algorithms using natural language.
              Combine multiple algorithms to get exactly the content you want.
            </p>
            </div>
            <button
              onClick={() => setShowPromptForm(!showPromptForm)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showPromptForm ? 'Cancel' : 'Add New'}
            </button>
          </div>

          {showPromptForm && (
            <form onSubmit={handlePromptSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Algorithm Name</label>
                  <input
                    type="text"
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Tech Innovations"
              aria-label="Enter a name for your algorithm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prompt</label>
                  <textarea
                    value={newPrompt.prompt}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Find content that explains complex technical concepts in simple terms, focuses on practical applications, and includes demonstrations or examples."
              aria-label="Enter your algorithm's filtering rules"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Add Algorithm
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {preferences.customPrompts.map((prompt, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{prompt.name}</h4>
                  <p className="text-sm text-gray-500">{prompt.prompt}</p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    checked={prompt.active}
                    onChange={() => {
                      const updatedPrompts = preferences.customPrompts.map((p, i) =>
                        i === index ? { ...p, active: !p.active } : p
                      );
                      handlePreferenceChange('customPrompts', updatedPrompts);
                    }}
                  />
                  <span className="text-sm text-gray-600">Active</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
