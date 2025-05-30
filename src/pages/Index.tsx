
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";
import { UserControl } from "@/components/UserControl";
import { StrategyDetails } from "@/components/StrategyDetails";
import { LiveBotStream } from "@/components/LiveBotStream";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="page-container">
      <Navigation />
      
      {/* Hero Section - Reduced height and spacing */}
      <section className="hero-gradient min-h-[60vh] flex items-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 fade-in">
              Algorithmic Trading — Now For Everyone
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto fade-in">
              Strategic day trading powered by proprietary algorithms, designed for long-term performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => {
                  const strategySection = document.getElementById('strategy-section');
                  if (strategySection) {
                    strategySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Learn More About Our Strategy
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                  >
                    Watch Demo Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full">
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/vqPy67DuHAQ"
                      title="Demo Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      
      <div id="strategy-section">
        <StrategyDetails />
      </div>
      
      <UserControl />
      <Stats />
      
      {/* Moved LiveBotStream to the bottom of the page */}
      <LiveBotStream />
    </div>
  );
};

export default Index;
