// src/pages/ProjectManagementApp.tsx
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
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
        {/* Left side - Text content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4">
            Empowering Teams Through Seamless Collaboration
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
            Buggit is a project management app designed to bring teams together, streamline workflows, and enhance productivity.
          </p>
          <div className="mt-8">
            {!user ? (
              <Button asChild size="lg">
                <Link to="/login">Get Started</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="flex-1 w-full md:w-1/2">
          <div className="bg-transparent p-4"> {/* Transparent container */}
            <img
              src="/lovable_uploads/NoteCollaboration.png"
              alt="Team Collaboration in Notes App"
              className="w-full h-auto object-contain"
              style={{ 
                maxWidth: '800px',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' // This adds shadow without background
              }}
            />
          </div>
        </div>

      {/* Benefits Section */}
      <section className="mb-16">
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
      </section>

      {/* Statistics Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Productivity Statistics
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-muted">
            <CardHeader>
              <CardTitle>Time Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organizations can reduce up to 400 hours of meeting time per year.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-muted">
            <CardHeader>
              <CardTitle>Project Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                77% of high-performing projects utilize project management software.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Transform Your Team's Productivity?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of teams already using Buggit to streamline their project management and boost collaboration.
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
    <Footer />
  </>
);
}
