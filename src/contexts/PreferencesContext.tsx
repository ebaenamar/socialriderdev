import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AlgorithmPrompt {
  name: string;
  prompt: string;
  active: boolean;
}

interface MentalWellnessProfile {
  focusIssues: string[];  // ['adhd', 'depression', 'anxiety', etc]
  engagementPatterns: {
    timeSpent: number;      // minutes per session
    sessionFrequency: number; // sessions per day
    lateNightUsage: boolean; // usage after midnight
    rapidScrolling: boolean; // quick content consumption
  };
  contentPreferences: {
    needsMotivational: boolean;
    needsMindfulness: boolean;
    needsProductivity: boolean;
    preferredApproach: 'gentle' | 'direct' | 'humorous';
  };
}

interface UserPreferences {
  outOfEchoChamber: boolean;
  contentTypes: string[];
  customPrompts: AlgorithmPrompt[];
  wellnessProfile: MentalWellnessProfile;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  getActivePrompts: () => AlgorithmPrompt[];
}

const defaultPreferences: UserPreferences = {
  outOfEchoChamber: false,
  contentTypes: ['educational', 'entertainment', 'news', 'mindfulness', 'motivation', 'self-improvement'],
  wellnessProfile: {
    focusIssues: [],
    engagementPatterns: {
      timeSpent: 0,
      sessionFrequency: 0,
      lateNightUsage: false,
      rapidScrolling: false
    },
    contentPreferences: {
      needsMotivational: false,
      needsMindfulness: false,
      needsProductivity: false,
      preferredApproach: 'gentle'
    }
  },
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

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userPreferences');
      return saved ? JSON.parse(saved) : defaultPreferences;
    }
    return defaultPreferences;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        ...newPreferences,
        wellnessProfile: {
          ...prev.wellnessProfile,
          ...(newPreferences.wellnessProfile || {}),
          engagementPatterns: {
            ...prev.wellnessProfile.engagementPatterns,
            ...(newPreferences.wellnessProfile?.engagementPatterns || {})
          }
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const getActivePrompts = () => {
    return preferences.customPrompts.filter(prompt => prompt.active);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, getActivePrompts }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
