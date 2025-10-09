
'use client';

import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from '../components/providers/SocketProvider';
import { TanstackProvider } from '../components/providers/TanstackProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <TanstackProvider>{children}</TanstackProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
