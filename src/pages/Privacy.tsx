import { Navigation } from "@/components/Navigation";

const Privacy = () => {
  return (
    <div className="page-container bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="w-full h-[calc(100vh-8rem)]">
          <iframe
            src="https://drive.google.com/file/d/1AOrV0qM5A031NAJZ6tEm8kBwpgto0gwk/preview"
            className="w-full h-full border-0"
            title="Privacy Policy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default Privacy;
