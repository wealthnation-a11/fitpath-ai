
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-fitpath-gray page-transition">
      <Navbar />
      <main className="flex-grow container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Layout;
