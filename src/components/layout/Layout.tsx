
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-fitpath-gray">
      <Navbar />
      <main className="flex-grow container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} FitPath AI. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-fitpath-blue">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-fitpath-blue">
                Privacy Policy
              </a>
              <a href="/contact" className="text-sm text-gray-600 hover:text-fitpath-blue">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
