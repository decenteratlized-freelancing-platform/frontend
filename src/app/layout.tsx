import './globals.css';
import SessionWrapper from './../components/SessionWrapper';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from './ClientLayout';
import { SocketContextProvider } from '../context/SocketContext';
import { LoaderProvider } from '../context/LoaderContext';
import { CurrencyProvider } from '../context/CurrencyProvider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-zinc-950`}>
        <CurrencyProvider>
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
        </CurrencyProvider>
      </body>
    </html>
  );
}

