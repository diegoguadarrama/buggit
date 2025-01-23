// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('No code in URL');
        }

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }

        // On success, redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error in auth callback:', error);
        // On error, redirect to login
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Show loading spinner while processing
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
