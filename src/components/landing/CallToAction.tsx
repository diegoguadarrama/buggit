import { Button } from '@/components/ui/button'

export default function CallToAction() {
  return (
    <section className="bg-[#123524] text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Project Management?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Transform your workflow with Buggit. Sign up to start using Buggit for free.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-[#123524] hover:bg-gray-200"
          onClick={() => window.location.href = '/login'}
        >
          Start in the Free Plan
        </Button>
      </div>
    </section>
  )
}