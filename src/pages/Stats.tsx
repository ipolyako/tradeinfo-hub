
import { Navigation } from "@/components/Navigation";

const Stats = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full aspect-[16/9]">
          <iframe
            src="https://docs.google.com/spreadsheets/d/1QfIyxlP73oPx5FDwimzG6thbKIhRb6jgMNRkbNLfVd8/edit?usp=sharing"
            className="w-full h-full border-0"
            title="Trading Statistics"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
