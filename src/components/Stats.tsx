export const Stats = () => {
  const stats = [
    { number: "10M+", label: "Active Traders" },
    { number: "$50B+", label: "Daily Volume" },
    { number: "100+", label: "Global Markets" },
    { number: "0.01s", label: "Execution Time" }
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