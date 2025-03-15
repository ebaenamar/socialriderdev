'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PreferencesProvider } from '@/contexts/PreferencesContext';

const queryClient = new QueryClient();

type ProvidersProps = {
  children: any;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        {children}
      </PreferencesProvider>
    </QueryClientProvider>
  );
}
