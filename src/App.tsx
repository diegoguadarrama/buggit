import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProjectProvider } from "./components/ProjectContext";
import { ThemeProvider } from "./lib/themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import Landing from "./pages/Landing";
import { useAuth } from "./components/AuthProvider";
import { StrictMode, Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
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
      <I18nextProvider i18n={i18n}>
        <Suspense fallback="Loading...">
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ThemeProvider defaultTheme="light">
                <BrowserRouter>
                  <AuthProvider>
                    <ProjectProvider>
                      <AppRoutes />
                      <Toaster />
                      <Sonner />
                    </ProjectProvider>
                  </AuthProvider>
                </BrowserRouter>
              </ThemeProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </Suspense>
      </I18nextProvider>
    </StrictMode>
  );
};

export default App;