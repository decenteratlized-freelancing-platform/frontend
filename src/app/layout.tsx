import './globals.css';
import SessionWrapper from './../components/SessionWrapper';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from './ClientLayout';
import { SocketContextProvider } from '../context/SocketContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <SessionWrapper>
            <SocketContextProvider>
        <ClientLayout>
            {children}
            <Toaster />
        </ClientLayout>
            </SocketContextProvider>
          </SessionWrapper>
      </body>
    </html>
  );
}

