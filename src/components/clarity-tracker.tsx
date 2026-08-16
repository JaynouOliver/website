'use client';

import { useEffect, useRef } from 'react';
import { useClarity } from '@/hooks/use-clarity';

interface ClarityTrackerProps {
  pageName: string;
  children: React.ReactNode;
}

export function ClarityTracker({ pageName, children }: ClarityTrackerProps) {
  const { trackPageView, trackSectionView } = useClarity();
  const sectionRefs = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    // Track page view when component mounts
    trackPageView(pageName);

    // Set up intersection observer for section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting && !sectionRefs.current.has(sectionId)) {
            sectionRefs.current.set(sectionId, entry);
            trackSectionView(sectionId);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible
        rootMargin: '0px 0px -10% 0px', // Trigger slightly before section is fully visible
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    // Store ref in variable for cleanup
    const currentRefs = sectionRefs.current;

    return () => {
      observer.disconnect();
      currentRefs.clear();
    };
  }, [pageName, trackPageView, trackSectionView]);

  return <>{children}</>;
}
