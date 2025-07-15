'use client';

import { Provider as ReduxProvider } from 'react-redux'; // Rename to avoid import conflicts
import { store } from '@/_lib/store/store'; // Adjust to your store path
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bootstrapAuth } from '@/_lib/store/slices/authSlice'; // Adjust to your slice path
import type { AppDispatch } from '@/_lib/store/store'; // Import your AppDispatch type

// Separate component for bootstrap logic (uses hooks inside the Redux Provider)
function Bootstrap() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(bootstrapAuth()); // Dispatch thunk on mount (client-side only)
  }, [dispatch]);

  return null; // This component doesn't render anything
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <Bootstrap />
      {children}
    </ReduxProvider>
  );
}
