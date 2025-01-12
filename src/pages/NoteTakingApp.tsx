import { Helmet } from 'react-helmet'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

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
          <section className="bg-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
                  Notes That Work as Hard as You Do
                </h1>
                <p className="text-xl mb-12 text-gray-600">
                  Capture, organize, and act on your ideas like never before. With Buggit, your notes aren't just static text—they're dynamic tools for productivity.
                </p>
              </div>
            </div>
          </section>

          {/* Why Buggit Section */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Why Buggit?</h2>
              <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
                Because your ideas deserve more than just a home—they need a launchpad.
              </p>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Effortless Note-Taking</h3>
                  <p>Jot down your thoughts in an instant with a distraction-free interface that helps you focus on what matters.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Stay Organized, Stay Ahead</h3>
                  <p>Our tagging and folder system keeps everything exactly where you need it. Find any note in seconds.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Turn Notes Into Action</h3>
                  <p>Transform your ideas into tasks and projects with our built-in task management tools. No more switching apps.</p>
                </div>
              </div>
            </div>
          </section>

          {/* For the Doers Section */}
          <section className="bg-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">For the Doers, the Dreamers, and Everyone In Between</h2>
                <p className="text-lg mb-8">
                  Whether you're brainstorming your next big idea, organizing your day, or managing a project, Buggit adapts to your workflow. From students to CEOs, Buggit empowers you to stay on top of everything.
                </p>
              </div>
            </div>
          </section>

          {/* Cloud Section */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">Your Second Brain, in the Cloud</h2>
                <p className="text-lg mb-8">
                  Securely store and sync your notes across devices. Access them anywhere, anytime—even offline.
                </p>
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
                  <h3 className="text-xl font-semibold">Lightning-Fast Search</h3>
                  <p>Find the right note the moment you need it, no matter how much you've stored.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Collaboration Made Easy</h3>
                  <p>Share notes with your team or friends and collaborate in real time.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Customizable to You</h3>
                  <p>Tailor your notes to your style with themes, formatting options, and flexible layouts.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">See What's Possible With Buggit</h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto">
                Your thoughts are valuable—treat them that way. Join the thousands who've upgraded their note-taking game with Buggit.
              </p>
              <div className="space-y-8">
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
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}