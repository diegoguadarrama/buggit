// src/pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL and handle hash fragments
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const hashParams = new URLSearchParams(url.hash.substring(1)); // Handle hash fragments
        const searchParams = url.searchParams;

        // Check for code in both search params and hash fragments
        const code = searchParams.get('code') || hashParams.get('code');
        const isLinking = searchParams.get('linking') === 'true' || hashParams.get('linking') === 'true';

        // Check for error in URL
        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        if (!code) {
          // Instead of throwing error, try to get session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // If we have a session, we can proceed
            navigate('/dashboard');
            return;
          }
          throw new Error('No authentication code provided');
        }

        // Exchange the code for a session
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        if (!session) {
          throw new Error('No session obtained');
        }

        if (isLinking) {
          toast({
            title: "Success",
            description: "Your accounts have been linked successfully!",
          });
        } else {
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message);
        
        // Show error toast with more helpful message
        toast({
          title: "Authentication Error",
          description: error.message === 'No authentication code provided' 
            ? "Unable to complete authentication. Please try signing in again."
            : error.message || "Failed to complete authentication",
          variant: "destructive",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  // Show a more informative loading state
  if (!error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm text-gray-500">Completing authentication...</p>
      </div>
    );
  }

  // Show error state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-red-500 mb-4">Authentication failed</p>
      <p className="text-sm text-gray-500 mb-2">{error}</p>
      <p className="text-sm text-gray-500">Redirecting to login...</p>
    </div>
  );
}
