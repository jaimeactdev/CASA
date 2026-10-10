'use client';

import { useEffect } from 'react';

export default function ConsoleConfig() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.log = () => {};
      console.error = () => {};
    }
  }, []);

  return null;
}
