import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { HowItWorks } from "@/components/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-gradient min-h-[80vh] flex items-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in">
              Algorithmic Trading, Redefined
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto fade-in">
              Strategic day trading powered by proprietary algorithms, designed for long-term performance without overnight exposure
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 fade-in">
              Learn More About Our Strategy
            </Button>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Features />
      <Stats />
    </div>
  );
};

export default Index;