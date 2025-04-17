
import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Ensure Paystack script is loaded
  useEffect(() => {
    const existingScript = document.getElementById("paystack-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = "paystack-script";
      script.async = true;
      document.head.appendChild(script);
      
      return () => {
        // Clean up script when component unmounts
        if (document.getElementById("paystack-script")) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

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
