import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { hash, searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error exchanging code for session:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
