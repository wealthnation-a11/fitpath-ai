
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const TawkToWidget = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Only load Tawk.to for authenticated users
    if (!user) return;

    // Initialize Tawk.to API
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Set custom widget header
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: 'br', // bottom-right
          xOffset: 20,
          yOffset: 20
        },
        mobile: {
          position: 'br',
          xOffset: 10,
          yOffset: 10
        }
      }
    };

    // Set widget title and user attributes
    window.Tawk_API.onLoad = function() {
      window.Tawk_API.setAttributes({
        name: user.name,
        email: user.email,
      });
    };

    // Create and append the script
    const script = document.createElement("script");
    script.async = true;
    script.src = 'https://embed.tawk.to/1g5oh9lni/default';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    // Add the script to the document head
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts or user logs out
    return () => {
      // Remove the script
      const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Hide the widget if it exists
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, [user]);

  return null; // This component doesn't render anything visible
};

export default TawkToWidget;
