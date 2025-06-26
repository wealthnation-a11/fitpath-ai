
import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import TawkToWidget from "@/components/chat/TawkToWidget";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Ensure Paystack script is loaded
  useEffect(() => {
    const existingScript = document.getElementById("paystack-script");
    if (!existingScript && !window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = "paystack-script";
      script.async = true;
      
      script.onload = () => {
        console.log("Paystack script loaded successfully");
      };
      
      script.onerror = () => {
        console.error("Failed to load Paystack script");
      };
      
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
      <TawkToWidget />
    </div>
  );
};

export default Layout;
