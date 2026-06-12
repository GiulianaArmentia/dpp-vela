'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/dashboard/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
