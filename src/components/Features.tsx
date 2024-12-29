import { LineChart, Shield, Zap, Clock } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <LineChart className="h-8 w-8 text-primary" />,
      title: "Advanced Analytics",
      description: "Real-time market analysis and predictive trading signals"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Trading",
      description: "Bank-grade security with 256-bit encryption"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Instant Execution",
      description: "Lightning-fast trade execution with zero delays"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "24/7 Trading",
      description: "Access global markets around the clock"
    }
  ];

  return (
    <section id="features" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Trading Features</h2>
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