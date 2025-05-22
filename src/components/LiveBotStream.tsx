
import { useIsMobile } from "@/hooks/use-mobile";
import { Youtube } from "lucide-react";

export const LiveBotStream = () => {
  const isMobile = useIsMobile();
  
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
        ) : (
          <div className="w-full aspect-video max-w-4xl mx-auto rounded-md overflow-hidden shadow-lg">
            <iframe 
              src="https://www.youtube.com/embed/live_stream?channel=UCUY8wd7gFbc9Sb-rD1KRGtQ"
              className="w-full h-full border-none"
              title="Live Trading Bot Stream"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        <div className="mt-6 text-sm text-muted-foreground text-center max-w-2xl mx-auto">
          <p>Note: If the stream is offline, please check back later or refer to our historical and current performance data.</p>
        </div>
      </div>
    </section>
  );
};
