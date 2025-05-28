
import { useIsMobile } from "@/hooks/use-mobile";
import { Youtube } from "lucide-react";
import { useState } from "react";

export const LiveBotStream = () => {
  const isMobile = useIsMobile();
  const [showStream, setShowStream] = useState(false);
  
  const handleLoadStream = () => {
    setShowStream(true);
  };

  const handleBackToFallback = () => {
    setShowStream(false);
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
        ) : !showStream ? (
          <div className="w-full aspect-video max-w-4xl mx-auto rounded-md overflow-hidden shadow-lg bg-muted/20 flex flex-col items-center justify-center p-8">
            <img 
              src="/lovable-uploads/58d7ebfe-9fcf-4c7c-8332-89656975d43b.png" 
              alt="Trading Charts - Stream Preview" 
              className="w-full h-auto max-h-64 object-contain rounded-md shadow-sm mb-6"
            />
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Live Trading Bot Stream</h3>
              <p className="text-muted-foreground max-w-2xl">
                Watch our algorithmic trading bot in action. Click below to load the live stream or visit our YouTube channel.
              </p>
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleLoadStream}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center text-base font-medium"
                >
                  <Youtube className="h-5 w-5" />
                  Load Live Stream
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
            />
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleBackToFallback}
                className="px-3 py-1 bg-black/50 text-white text-sm rounded hover:bg-black/70 transition-colors"
              >
                Back to Preview
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-sm text-muted-foreground text-center max-w-2xl mx-auto">
          <p>
            {!showStream 
              ? "Load the stream above to watch live trading activity, or explore our performance data in the Stats section."
              : "If the stream shows as unavailable, it may be temporarily offline. Use the 'Back to Preview' button to return."
            }
          </p>
        </div>
      </div>
    </section>
  );
};
