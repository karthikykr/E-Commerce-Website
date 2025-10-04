'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/redux/store';
import { restoreAuth } from '@/redux/slices/authSlice';

function InnerProviders({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <InnerProviders>{children}</InnerProviders>
    </Provider>
  );
}
