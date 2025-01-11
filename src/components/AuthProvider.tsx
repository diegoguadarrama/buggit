import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          await clearAuthState();
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
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

      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const clearAuthState = async () => {
    try {
      setSession(null);
      setUser(null);
      localStorage.removeItem('currentProjectId');
      // Small delay to ensure state is cleared before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Error clearing auth state:', error);
      // Fallback navigation
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
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Always clear local state, even if Supabase sign out fails
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