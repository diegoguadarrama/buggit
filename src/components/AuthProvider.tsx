// src/components/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { Provider, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add this near the top of the file, outside the component
const handleAuthError = async (error: any) => {
  if (error.message?.includes('Email link is invalid or has expired')) {
    return { type: 'INVALID_LINK' };
  }
  
  if (error.message?.includes('User already registered')) {
    return { type: 'EXISTING_USER' };
  }
  
  return { type: 'UNKNOWN', error };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval error:', error);
          await handleAuthError(error);
          await clearAuthState();
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        await handleAuthError(error);
        await clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        await clearAuthState();
        return;
      }

      // Handle user linking scenario
      if (event === 'USER_UPDATED') {
        const currentUser = session?.user;
        if (currentUser?.identities && currentUser.identities.length > 1) {
          // User has multiple auth providers linked
          console.log('User has linked accounts:', currentUser.identities);
        }
      }

      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const clearAuthState = async () => {
    try {
      // Clear all state synchronously first
      localStorage.removeItem('currentProjectId');
      setSession(null);
      setUser(null);

      // Wait for a microtask to ensure state updates are processed
      await Promise.resolve();

      // Use window.location for more reliable navigation
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing auth state:', error);
      window.location.href = '/login';
    }
  };

  const signOut = async () => {
    try {
      // First attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out from Supabase:', error);
      }

      // Wait for a microtask to ensure Supabase operations complete
      await Promise.resolve();
      
      // Clear state and navigate
      await clearAuthState();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Fallback to clearing state and navigating
      await clearAuthState();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
