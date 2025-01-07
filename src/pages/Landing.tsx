import { Helmet } from 'react-helmet'
import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import CallToAction from '@/components/landing/CallToAction'
import Footer from '@/components/landing/Footer'
import Pricing from '@/components/landing/Pricing'

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>Buggit - Project Management Tool for Busy Teams | Kanban, List, Calendar Views</title>
        <meta name="description" content="Buggit is the ultimate project management tool for busy teams. Featuring Kanban board, list view, calendar view, and thread-style comments. Try it now!" />
        <meta name="keywords" content="project management, kanban board, list view, calendar view, team collaboration, task management" />
        <link rel="canonical" href="https://app.buggit.com" />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Features />
          <Pricing />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </>
  )
}