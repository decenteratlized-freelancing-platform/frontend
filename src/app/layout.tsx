import './globals.css';
import SessionWrapper from './../components/SessionWrapper';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
          <Toaster />
        </SessionWrapper>
      </body>
    </html>
  );
}
