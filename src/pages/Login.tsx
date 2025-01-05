import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Only set up the auth state listener if user is not authenticated
  useEffect(() => {
    if (user) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, navigating to home");
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          duration: 3000, // Toast will disappear after 3 seconds
        });
        navigate("/");
      }
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
          duration: 3000,
        });
      }

      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery email sent");
        toast({
          title: "Password Recovery",
          description: "Please check your email for password reset instructions.",
          duration: 5000,
        });
      }

      // Handle authentication errors
      if (event === "SIGNED_IN" && !session) {
        console.error("Authentication failed");
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please check your email and password.",
          duration: 5000,
        });
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, toast, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Buggit
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to continue
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#123524',
                  brandAccent: '#123524',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#123524',
                  defaultButtonBackgroundHover: '#123524',
                  defaultButtonBorder: '#123524',
                  defaultButtonText: 'white',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 text-sm font-medium text-white bg-[#123524] hover:bg-[#123524]/90 rounded-md disabled:bg-[#123524] disabled:opacity-70',
              loader: 'border-[#123524]',
              input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#123524] focus:border-transparent',
            }
          }}
          theme="light"
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                button_label: 'Sign In',
                loading_button_label: 'Signing In...',
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;