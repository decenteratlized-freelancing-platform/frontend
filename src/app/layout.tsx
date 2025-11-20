import './globals.css';
import SessionWrapper from './../components/SessionWrapper';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { SocketContextProvider } from '@/context/SocketContext';
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <SocketContextProvider>
            {children}
            <Toaster />
          </SocketContextProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
