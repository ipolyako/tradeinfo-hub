import { useIsMobile } from "@/hooks/use-mobile";
import { Youtube } from "lucide-react";
import { useState, useEffect } from "react";

export const LiveBotStream = () => {
  const isMobile = useIsMobile();
  const [showFallback, setShowFallback] = useState(false);
  const [attemptedLoad, setAttemptedLoad] = useState(false);
  
  // Automatically show fallback after a timeout to avoid the "video unavailable" message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!attemptedLoad) {
        setShowFallback(true);
      }
    }, 2000); // Show fallback after 2 seconds if stream hasn't loaded

    return () => clearTimeout(timer);
  }, [attemptedLoad]);

  const handleIframeLoad = () => {
    setAttemptedLoad(true);
    // Keep showing the actual stream if it loads successfully
  };

  const handleIframeError = () => {
    setShowFallback(true);
  };

  const handleRetryStream = () => {
    setShowFallback(false);
    setAttemptedLoad(false);
  };
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Live Bot Stream</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Watch our trading bot in action with real-time market activity
          </p>
        </div>
        
        {isMobile ? (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-md">
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
        ) : showFallback ? (
          <div className="w-full aspect-video max-w-4xl mx-auto rounded-md overflow-hidden shadow-lg bg-muted/20 flex flex-col items-center justify-center p-8">
            <img 
              src="/lovable-uploads/58d7ebfe-9fcf-4c7c-8332-89656975d43b.png" 
              alt="Trading Charts - Stream Currently Offline" 
              className="w-full h-auto max-h-full object-contain rounded-md shadow-sm mb-6"
            />
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Live Stream Currently Offline</h3>
              <p className="text-muted-foreground max-w-2xl">
                Our trading bot stream is currently offline. Here's a preview of our trading interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <a 
                  href="https://www.youtube.com/channel/UCUY8wd7gFbc9Sb-rD1KRGtQ"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
                >
                  <Youtube className="h-5 w-5" />
                  Visit Our YouTube Channel
                </a>
                <button 
                  onClick={handleRetryStream}
                  className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Try Loading Stream Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video max-w-4xl mx-auto rounded-md overflow-hidden shadow-lg relative">
            <iframe 
              src="https://www.youtube.com/embed/live_stream?channel=UCUY8wd7gFbc9Sb-rD1KRGtQ&enablejsapi=1"
              className="w-full h-full border-none"
              title="Live Trading Bot Stream"
              allowFullScreen
              onError={handleIframeError}
              onLoad={handleIframeLoad}
            />
          </div>
        )}
        
        <div className="mt-6 text-sm text-muted-foreground text-center max-w-2xl mx-auto">
          <p>
            {showFallback 
              ? "Check back later for live streaming or explore our performance data in the Stats section."
              : "Note: If the stream appears unavailable, it may be temporarily offline. Please check back later."
            }
          </p>
        </div>
      </div>
    </section>
  );
};
