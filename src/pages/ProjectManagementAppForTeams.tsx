import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Helmet } from 'react-helmet';
import {
  Users,
  ClipboardList,
  Layout,
  Calendar,
  FileText,
  Zap,
  DollarSign,
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Unlimited Team Members",
    description: "Invite as many users as your project requires without worrying about additional costs.",
  },
  {
    icon: ClipboardList,
    title: "Efficient Task Assignment",
    description: "Easily assign tasks to team members, ensuring clarity and accountability.",
  },
  {
    icon: Layout,
    title: "Unified Task Board",
    description: "Collaborate on a shared task board where everyone can view, update, and manage tasks in real-time.",
  },
  {
    icon: Calendar,
    title: "Flexible Viewing Options",
    description: "Choose between list and calendar views to organize your tasks in the way that suits your team best.",
  },
  {
    icon: FileText,
    title: "Comprehensive Note-Taking",
    description: "Dive deeper into tasks by creating detailed notes and sharing them instantly with your team.",
  },
  {
    icon: Zap,
    title: "Real-Time Collaboration",
    description: "Experience seamless, real-time collaboration with our powerful note-taking feature, ensuring everyone stays on the same page.",
  },
  {
    icon: DollarSign,
    title: "Cost-Effective",
    description: "We don't charge per seat, making Buggit an affordable solution for teams of all sizes.",
  },
];

export default function ProjectManagementAppForTeams() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Project Management App For Teams - Buggit.com</title>
        <meta name="description" content="Buggit is a project management app designed to bring teams together, streamline workflows, and enhance productivity." />
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="flex flex-col min-h-screen">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            {/* Left side - Text content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="px-8 text-4xl font-bold mb-4">
                Empowering Teams Through Seamless Collaboration
              </h1>
              <p className="px-8 text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
                Buggit is a project management app designed to bring teams together, streamline workflows, and enhance productivity.
              </p>
              <div className="px-8 mt-8">
                {!user ? (
                  <Button asChild size="lg">
                    <Link to="/login">Get Started for Free</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                )}
              </div>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <div className="px-8 text-4xl font-bold text-primary">~400hrs</div>
                  <p className="px-8 text-sm text-muted-foreground">
                    Reduction in Meeting Time
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="px-8 text-4xl font-bold text-primary">77%</div>
                  <p className="px-8 text-sm text-muted-foreground">
                    High-Performing Projects Use PM Apps
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="flex-1 w-full md:w-1/2">
              <div className="bg-transparent p-4">
                <img
                  src="/lovable_uploads/NoteCollaboration.png"
                  alt="Team Collaboration in Notes App"
                  className="w-full h-auto object-contain"
                  style={{ 
                    maxWidth: '800px',
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-800/50">
            <div className="w-full -mx-4 px-4">
              <div className="max-w-[1400px] mx-auto py-16">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Why Choose Buggit for Your Team?
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {benefits.map((benefit, index) => (
                    <Card key={index} className="border border-muted">
                      <CardHeader>
                        <benefit.icon className="h-8 w-8 mb-2" />
                        <CardTitle>{benefit.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{benefit.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <section className="text-center py-24">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Team's Productivity?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join Buggit to streamline your project management and boost collaboration.
            </p>
            {!user ? (
              <Button asChild size="lg">
                <Link to="/login">Start Your Journey</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
