'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface EmailVerificationStatusProps {
  email: string;
  onVerified: () => void;
}

export default function EmailVerificationStatus({ email, onVerified }: EmailVerificationStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'info' | 'success' | 'error'>('info');

  const resendVerification = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Verification email sent successfully!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Mail className="h-16 w-16 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification email to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-gray-600">
          <p>Please check your inbox and click the verification link to activate your account.</p>
          <p className="mt-2 text-xs text-gray-500">
            The verification link will expire in 24 hours.
          </p>
        </div>

        {message && (
          <div className={`text-sm text-center p-3 rounded-lg ${
            status === 'success' ? 'bg-green-50 text-green-700' :
            status === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={resendVerification}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button>
          
          <Button
            onClick={onVerified}
            variant="ghost"
            className="w-full"
          >
            I've verified my email
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Can't find the email? Check your spam folder.</p>
        </div>
      </CardContent>
    </Card>
  );
}
