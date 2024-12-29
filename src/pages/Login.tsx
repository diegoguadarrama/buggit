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

  // Existing useEffect code...

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
              message: 'text-sm text-red-600'
            },
            style: {
              button: {
                '&:disabled': {
                  backgroundColor: '#123524',
                  opacity: '0.7',
                },
                '&:disabled:hover': {
                  backgroundColor: '#123524',
                }
              }
            }
          }}
          theme="light"
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                button_label: 'Sign In',
                loading_button_label: 'Signing In...',
                email_label: 'Email',
                password_label: 'Password',
              },
              forgotten_password: {
                link_text: 'Forgot Password?'
              }
            },
            translations: {
              "auth.error.missing_email_or_phone": "Looks like you forgot to type your email",
              "auth.error.invalid_email": "Please enter a valid email address",
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;
