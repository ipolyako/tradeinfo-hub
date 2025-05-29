import { useIsMobile } from "@/hooks/use-mobile";
import { Youtube } from "lucide-react";
import { useState, useEffect } from "react";

export const LiveBotStream = () => {
  const isMobile = useIsMobile();
  const [streamError, setStreamError] = useState(false);

  // Add effect to ensure proper scrolling on mobile
  useEffect(() => {
    if (isMobile) {
      // Force a reflow to ensure proper scrolling
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
  }, [isMobile]);

  // Scroll unlock script to prevent iOS scroll locking
  useEffect(() => {
    const unlockScroll = () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
    
    // Run on mount and every 2 seconds
    unlockScroll();
    const interval = setInterval(unlockScroll, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-20 bg-muted/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Live Bot Stream</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Watch our trading bot in action with real-time market activity
          </p>
        </div>
        
        {isMobile ? (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-md mb-8">
            <p className="text-center mb-4">
              For the best viewing experience, please open the YouTube stream directly:
            </p>
            <a 
              href="https://www.youtube.com/channel/UCUY8wd7gFbc9Sb-rD1KRGtQ/live"
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Youtube className="h-5 w-5" />
              Watch Live Stream
            </a>
          </div>
        ) : streamError ? (
          <div className="w-full aspect-video max-w-4xl mx-auto rounded-md overflow-hidden shadow-lg bg-muted/20 flex flex-col items-center justify-center p-8">
            <img 
              src="/lovable-uploads/58d7ebfe-9fcf-4c7c-8332-89656975d43b.png" 
              alt="Trading Charts - Stream Currently Offline" 
              className="w-full h-auto max-h-full object-contain rounded-md shadow-sm"
            />
            <p className="mt-4 text-muted-foreground text-center">
              Live stream is currently offline. Here's a preview of our trading interface.
            </p>
          </div>
        ) : (
          <div className="w-full aspect-video max-w-4xl mx-auto rounded-md overflow-hidden shadow-lg">
            <iframe 
              src="https://www.youtube.com/embed/live_stream?channel=UCUY8wd7gFbc9Sb-rD1KRGtQ"
              className="w-full h-full border-none"
              title="Live Trading Bot Stream"
              allowFullScreen
              onError={() => setStreamError(true)}
            ></iframe>
          </div>
        )}
        
        <div className="mt-6 text-sm text-muted-foreground text-center max-w-2xl mx-auto">
          <p>Note: If the stream is offline, you'll see our trading interface preview above. Please check back later for live streaming.</p>
        </div>
      </div>
    </section>
  );
};
