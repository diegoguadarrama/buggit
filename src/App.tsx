import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProjectProvider } from "./components/ProjectContext";
import { ThemeProvider } from "./lib/themes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NoteTakingApp from "@/pages/NoteTakingApp";
import { UserProvider } from "@/components/UserContext";
import { useAuth } from "./components/AuthProvider";
import { StrictMode, Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import Dashboard from "./pages/Dashboard";
import { SidebarProvider } from "./components/SidebarContext";
import AuthCallback from "./pages/AuthCallback";
import SignupPage from './pages/Signup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <UserProvider value={{ user }}>
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/note-taking-app" element={<NoteTakingApp />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notes" 
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <StrictMode>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback="Loading...">
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <ThemeProvider defaultTheme="light">
                  <BrowserRouter>
                    <AuthProvider>
                      <ProjectProvider>
                        <SidebarProvider>
                          <AppRoutes />
                          <Toaster />
                          <Sonner />
                        </SidebarProvider>
                      </ProjectProvider>
                    </AuthProvider>
                  </BrowserRouter>
                </ThemeProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </Suspense>
        </I18nextProvider>
      </ErrorBoundary>
    </StrictMode>
  </UserProvider>
  );
};

export default App;
