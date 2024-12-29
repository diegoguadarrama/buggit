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

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      console.log("User already logged in, redirecting to home");
      navigate("/");
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      if (event === "SIGNED_IN") {
        console.log("User signed in successfully");
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        navigate("/login");
      } else if (event === "USER_UPDATED") {
        console.log("User updated");
      } else if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery event");
        toast({
          title: "Password Recovery",
          description: "Please check your email for password reset instructions.",
        });
      }
    });

    return () => {
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
              button: 'w-full px-4 py-2 text-sm font-medium text-white bg-[#123524] hover:bg-[#123524]/90 rounded-md disabled:opacity-70 disabled:cursor-not-allowed',
              loader: 'border-[#123524]',
              input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#123524] focus:border-transparent',
              message: 'text-sm text-red-600'
            }
          }}
          theme="light"
          providers={[]}
          redirectTo={window.location.origin}
          onError={(error) => {
            console.error("Auth error:", error);
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message,
            });
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign In',
                loading_button_label: 'Signing In...',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign Up',
                loading_button_label: 'Signing Up...',
              },
              forgotten_password: {
                link_text: 'Forgot Password?',
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                button_label: 'Send Reset Instructions',
                loading_button_label: 'Sending Reset Instructions...',
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;