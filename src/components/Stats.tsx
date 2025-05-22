
import { useIsMobile } from "@/hooks/use-mobile";

export const Stats = () => {
  const isMobile = useIsMobile();
  
  const stats = [
    { number: "99.9%", label: "Execution Rate" },
    { number: "0.1s", label: "Avg. Response Time" },
    { number: "24/7", label: "Market Monitoring" }
  ];

  return (
    <section id="stats" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item flex flex-col items-center p-4">
              <span className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</span>
              <span className="mt-2 text-sm md:text-base text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
