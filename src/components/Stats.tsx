export const Stats = () => {
  const stats = [
    { number: "99.9%", label: "Execution Rate" },
    { number: "$500M+", label: "Daily Trading Volume" },
    { number: "0.1s", label: "Avg. Response Time" },
    { number: "24/7", label: "Market Monitoring" }
  ];

  return (
    <section id="stats" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="text-4xl font-bold text-primary">{stat.number}</span>
              <span className="mt-2 text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};