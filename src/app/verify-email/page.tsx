'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);

    if (tokenParam) {
      verifyEmail(tokenParam);
    } else {
      setVerificationStatus('error');
      setMessage('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message);
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handleResendEmail = async () => {
    // This would need the user's email, but for now we'll redirect to login
    router.push('/login?resend=true');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === 'loading' && (
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {verificationStatus === 'loading' && 'Verifying Your Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {verificationStatus === 'loading' && 'Please wait while we verify your email address.'}
            {verificationStatus === 'success' && 'Your email has been successfully verified.'}
            {verificationStatus === 'error' && 'There was a problem verifying your email.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {message}
          </div>
          
          {verificationStatus === 'success' && (
            <div className="space-y-3">
              <Button 
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Login
              </Button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
              >
                Resend Verification Email
              </Button>
              <Button 
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Back to Login
              </Button>
            </div>
          )}
          
          {verificationStatus === 'loading' && (
            <div className="text-center text-sm text-gray-500">
              This may take a few moments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
