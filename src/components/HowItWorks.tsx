
import { ArrowDownUp, Clock, Shield, TrendingUp } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <ArrowDownUp className="h-12 w-12 text-primary" />,
      title: "Opposite-Directional ETF Trading",
      description: "Our algorithms identify and capitalize on volatile price movements using paired ETF trading strategies"
    },
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Day Trading Only",
      description: "All positions are closed before market close, eliminating overnight market risk exposure"
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Risk Management",
      description: "Sophisticated risk controls and position sizing to protect capital during market volatility"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Performance Optimization",
      description: "Continuous algorithm refinement based on market conditions and performance metrics"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Our algorithmic trading service combines advanced technology with proven strategies to deliver consistent results
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-6">
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
