import './globals.css';
import SessionWrapper from './../components/SessionWrapper';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from './ClientLayout';
import { SocketContextProvider } from '../context/SocketContext';
import { LoaderProvider } from '../context/LoaderContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <SessionWrapper>
            <LoaderProvider>
              <SocketContextProvider>
                <ClientLayout>
                    {children}
                    <Toaster />
                </ClientLayout>
              </SocketContextProvider>
            </LoaderProvider>
          </SessionWrapper>
      </body>
    </html>
  );
}

