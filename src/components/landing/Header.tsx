import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-primary shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          Buggit
        </Link>
        <div className="space-x-4">
          <a href="#pricing" className="text-white hover:text-gray-200">Pricing</a>
          <a href="https://www.buggit.com/note-taking-app" className="text-white hover:text-gray-200">Notes</a>
          <Button 
            variant="outline" 
            className="bg-white text-primary hover:bg-gray-200"
            onClick={() => window.location.href = '/login'}
          >
            Log In
          </Button>
          <Button 
            className="bg-white text-primary hover:bg-gray-200"
            onClick={() => window.location.href = '/login'}
          >
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  )
}