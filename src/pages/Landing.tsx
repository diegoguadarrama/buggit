import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { KanbanSquare, ListTodo, Calendar, Users, MessageSquare } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Simple Project Management for Growing Teams
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Buggit helps teams stay organized and deliver projects on time with flexible views, 
              real-time collaboration, and powerful task management features.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="text-base"
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Project Management Made Simple
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to manage projects effectively
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <KanbanSquare className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  Kanban Board View
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Visualize your workflow with a flexible Kanban board. Drag and drop tasks 
                  between stages to keep your project moving forward.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <ListTodo className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  List View
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Switch to list view for a detailed overview of all tasks. Sort and filter 
                  to find exactly what you need.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Calendar className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  Calendar View
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Plan ahead with the calendar view. See all your deadlines and milestones 
                  in a clear monthly overview.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <MessageSquare className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  Thread-Style Comments
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Keep discussions organized with thread-style comments. Collaborate effectively 
                  with your team right where the work happens.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Team Collaboration
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Built for teams of all sizes
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Invite your team members, assign tasks, and collaborate in real-time. 
              Buggit scales with your team, whether you're a startup or an enterprise.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="text-base"
              >
                <Users className="mr-2 h-5 w-5" />
                Start Collaborating
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;