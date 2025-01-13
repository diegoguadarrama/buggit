import { Helmet } from 'react-helmet'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { PenLine, Users, ListTodo } from "lucide-react";

export default function NoteTakingApp() {
  const navigate = useNavigate();

  // Remove dark mode class when page is mounted
  useEffect(() => {
    const html = document.documentElement;
    const originalClass = html.className;
    html.classList.remove('dark');

    return () => {
      html.className = originalClass;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Buggit - Notes That Work as Hard as You Do</title>
        <meta name="description" content="Transform your note-taking experience with Buggit. Rich text support, real-time collaboration, and seamless task integration." />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold">
                  Notes That Work as Hard as You Do
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    A beautiful and intuitive note-taking app that helps you capture, organize, and share your ideas effortlessly.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={() => navigate('/login')}
                  >
                    Get Started Free
                  </Button>
                </div>
                <div className="relative">
                  <img 
                    src="/lovable_uploads/notes-page-hero.png" 
                    alt="Buggit Notes Interface" 
                    className="rounded-lg shadow-xl w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Why Buggit Section */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">A Powerful Note Taking App</h2>
              <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
                Because your ideas deserve more than just a home—they need a launchpad.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <PenLine className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Effortless Note-Taking</h2>
                  </div>
                  <p>Jot down your thoughts in an instant with a distraction-free interface that helps you focus on what matters.</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Collaborate in Real Time</h2>
                  </div>
                  <p>Working alone is great, but working with your team is even better.</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <ListTodo className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Turn Notes Into Action</h2>
                  </div>
                  <p>Transform your ideas into tasks and projects with our built-in task management tools. No more switching apps.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Features You'll Love:</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Rich Text & Media Support</h3>
                  <p>Add links, images, checklists, and more to make your notes come alive.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Text to Task</h3>
                  <p>Turn your notes into tasks with our built-in task management tools right from the text editor.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Collaboration Made Easy</h3>
                  <p>Share notes with your team or friends and collaborate in real time.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Customizable to You</h3>
                  <p>Tailor your notes to your style with all your favorite formatting options.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary text-white py-20 flex items-center justify-center">
            <div className="text-center space-y-8">
              <h3 className="text-2xl font-bold">Start Taking Smarter Notes Today</h3>
              <p className="text-lg mb-8">Sign up for free and experience the future of note-taking.</p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => navigate('/login')}
              >
                Get Started Free
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}