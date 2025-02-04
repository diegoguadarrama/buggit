import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("w-full border-t bg-white", className)}>
      <div className="max-w-7xl mx-auto py-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="text-lg font-bold">Buggit</Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/terms" className="text-sm">Terms of Service</Link>
            <Link to="/privacy" className="text-sm">Privacy Policy</Link>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} Buggit. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
