import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="bg-primary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to Buggit – The Project Management Tool Designed for Busy Teams
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Say goodbye to cluttered workflows and disorganized tasks. With Buggit, you'll have everything you need to manage projects effectively, whether you're at your desk or on your mobile device.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-primary hover:bg-gray-200"
          onClick={() => window.location.href = '/login'}
        >
          Get Started for Free
        </Button>
      </div>
    </section>
  )
}