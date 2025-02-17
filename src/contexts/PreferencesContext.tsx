import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  getActivePrompts: () => AlgorithmPrompt[];
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
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
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
