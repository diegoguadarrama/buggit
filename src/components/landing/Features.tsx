import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Kanban, List, Calendar, MessageSquare, Users, Paperclip, Smartphone } from 'lucide-react'

const features = [
  {
    title: 'Kanban Board',
    description: 'Visualize your projects in an easy-to-use Kanban board. Move tasks with a simple drag-and-drop, track progress at a glance, and keep workflows running smoothly.',
    icon: Kanban,
  },
  {
    title: 'List View',
    description: 'Break down tasks into actionable to-dos with our List View. Perfect for detail-oriented team members who love to check off their accomplishments.',
    icon: List,
  },
  {
    title: 'Calendar View',
    description: 'Plan ahead with the Calendar View. Stay on top of deadlines, manage schedules, and coordinate projects—all in a beautifully designed interface.',
    icon: Calendar,
  },
  {
    title: 'Thread-Style Comments',
    description: 'Say goodbye to miscommunication! With thread-style comments, you can keep conversations organized around specific tasks. Your team stays on the same page, even when working remotely.',
    icon: MessageSquare,
  },
  {
    title: 'Invite Your Team',
    description: 'Collaboration has never been easier. Invite your team to join Buggit, assign tasks, and track progress in real time. It\'s teamwork, simplified.',
    icon: Users,
  },
  {
    title: 'Attach Files',
    description: 'Attach important documents, images, and files directly to tasks. Keep everything your team needs in one place—no more hunting for files.',
    icon: Paperclip,
  },
  {
    title: 'Optimized for Mobile',
    description: 'Whether you\'re in the office, at home, or on the go, Buggit works seamlessly on your smartphone. With a responsive design and powerful mobile functionality, you can manage your projects anytime, anywhere.',
    icon: Smartphone,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Teams Love Buggit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <Icon className="w-10 h-10 text-[#123524] mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  )
}