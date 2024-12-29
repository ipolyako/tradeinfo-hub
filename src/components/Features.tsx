import { LineChart, Shield, Zap, Clock, ArrowDownUp, Brain, Target, Lock } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Proprietary Algorithms",
      description: "Advanced trading algorithms designed to identify market opportunities"
    },
    {
      icon: <ArrowDownUp className="h-8 w-8 text-primary" />,
      title: "ETF Strategy",
      description: "Specialized in opposite-directional ETF trading for optimal returns"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Day-Only Trading",
      description: "Zero overnight positions for reduced market exposure risk"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Strategic Execution",
      description: "Precise entry and exit points determined by market conditions"
    },
    {
      icon: <LineChart className="h-8 w-8 text-primary" />,
      title: "Performance Analytics",
      description: "Detailed tracking and analysis of trading performance"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Risk Management",
      description: "Advanced risk controls and position sizing strategies"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Real-Time Execution",
      description: "Lightning-fast trade execution with minimal latency"
    },
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: "Account Security",
      description: "Bank-grade security protocols for your trading account"
    }
  ];

  return (
    <section id="features" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">Advanced Trading Features</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Our platform combines cutting-edge technology with sophisticated trading strategies
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              {feature.icon}
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};