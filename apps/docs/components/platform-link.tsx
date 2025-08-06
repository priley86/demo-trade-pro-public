import React from 'react';

interface PlatformLinkProps {
  type: 'app' | 'api' | 'auth';
  path?: string;
  children: React.ReactNode;
  className?: string;
}

const urls = {
  app: process.env.NEXT_PUBLIC_DTP_APP_URL || '#',
  api: process.env.NEXT_PUBLIC_DTP_API_URL || '#',
  auth: process.env.NEXT_PUBLIC_DTP_AUTH_URL || '#',
};

export const PlatformLink: React.FC<PlatformLinkProps> = ({ type, path, children, className }) => {
  const baseUrl = urls[type];
  const finalUrl = path ? `${baseUrl.replace(/\/$/, '')}${path}` : baseUrl;

  return (
    <a href={finalUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
};
