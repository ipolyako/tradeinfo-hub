
import { Clock, Check, Shield, HandCoins } from "lucide-react";

export const UserControl = () => {
  const controlFeatures = [
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Flexible Scheduling",
      description: "Decide which days you want to run your bot on or let it always work for you"
    },
    {
      icon: <Check className="h-12 w-12 text-primary" />,
      title: "Execution Control",
      description: "You have control over execution lifecycle"
    },
    {
      icon: <HandCoins className="h-12 w-12 text-primary" />,
      title: "Use Your Brokerage",
      description: "Use your brokerage account to watch trades take place"
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Complete Freedom",
      description: "You have complete freedom to manage trades as they are placed by the bot"
    }
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">You Are In Control</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Our platform gives you full visibility and control over your automated trading experience
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {controlFeatures.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow fade-in">
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
