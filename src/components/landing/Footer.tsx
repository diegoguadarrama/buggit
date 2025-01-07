import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Buggit</h3>
            <p className="text-sm">Empowering teams to achieve more, together.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm hover:text-gray-300">Features</a></li>
              <li><a href="#pricing" className="text-sm hover:text-gray-300">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-gray-300">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-gray-300">Help Center</a></li>
              <li><a href="#" className="text-sm hover:text-gray-300">Contact Us</a></li>
              <li><a href="#" className="text-sm hover:text-gray-300">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-gray-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Buggit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}