import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-gradient min-h-[80vh] flex items-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in">
              Professional Trading Made Simple
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto fade-in">
              Access global markets with institutional-grade tools and real-time analytics
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 fade-in">
              Start Trading Now
            </Button>
          </div>
        </div>
      </section>

      <Features />
      <Stats />
    </div>
  );
};

export default Index;