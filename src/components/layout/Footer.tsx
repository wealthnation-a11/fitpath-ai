
import { Link } from "react-router-dom";
import { Dumbbell, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-fitpath-darkbg text-white py-8 border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-3">
              <Dumbbell className="h-8 w-8 text-fitpath-green" />
              <span className="text-2xl font-bold text-white">FitPath AI</span>
            </div>
            <p className="text-gray-400 text-center md:text-left">
              Your AI-Powered Fitness Companion
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/plans" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
              >
                Plans
              </Link>
              <Link 
                to="/faq" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
              >
                FAQ
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="flex flex-col space-y-2 text-gray-400">
              <p>+2347080573080</p>
              <p>+2349150230208</p>
              <p className="break-words">bonaventurejoshuaaugustine@gmail.com</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-fitpath-green transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FitPath AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
