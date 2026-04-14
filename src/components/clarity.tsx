'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

interface ClarityProviderProps {
  projectId?: string;
}

export function ClarityProvider({ projectId }: ClarityProviderProps) {
  useEffect(() => {
    // Only initialize if we have a project ID
    if (projectId && typeof window !== 'undefined') {
      try {
        Clarity.init(projectId);
        console.log('Microsoft Clarity initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Microsoft Clarity:', error);
      }
    }
  }, [projectId]);

  return null;
}

// Export Clarity functions for use throughout the app
export { Clarity };
