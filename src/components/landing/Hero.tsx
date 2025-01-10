import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="bg-white text-primary py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Project Management Tool Designed for Busy Teams
            </h1>
            <p className="text-xl mb-8">
              Say goodbye to cluttered workflows and disorganized tasks. With Buggit, you'll have everything you need to manage projects effectively, whether you're at your desk or on your mobile device.
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-beige-100"
              onClick={() => window.location.href = '/login'}
            >
              Get Started for Free
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/lovable_uploads/72cc8b57-7f04-4f63-b9ca-1702170cce35.png" 
              alt="Project Management Buggit Illustration" 
              className="w-full max-w-[500px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
