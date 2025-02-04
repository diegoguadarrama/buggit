import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className={cn("w-full border-b bg-white", className)}>
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Buggit
        </Link>
        <nav className="flex space-x-4">
          <Link to="/blog" className="text-gray-700 hover:text-gray-900">
            Blog
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-gray-900">
                Profile
              </Link>
              <Button variant="outline" onClick={() => {/* handle logout */}}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-gray-900">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
