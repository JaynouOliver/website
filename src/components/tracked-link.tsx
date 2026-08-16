'use client';

import { useClarity } from '@/hooks/use-clarity';
import Link from 'next/link';
import { ReactNode } from 'react';
import { trackGaEvent } from '@/lib/gtag';

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  linkType: 'social' | 'project' | 'nav' | 'other' | 'hackathon' | 'resume';
  linkName: string;
  context?: string;
}

export function TrackedLink({
  href,
  children,
  className,
  target,
  rel,
  onClick,
  linkType,
  linkName,
  context,
}: TrackedLinkProps) {
  const { trackLinkClick } = useClarity();

  const handleClick = (e?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    trackLinkClick(`${linkType}_${linkName}`, href);
    trackGaEvent('link_click', {
      link_type: linkType,
      link_name: linkName,
      href,
      context,
    });

    if (onClick) onClick(e);
  };

  return (
    <Link
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
