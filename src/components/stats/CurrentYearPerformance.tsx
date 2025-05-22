
import { useIsMobile } from "@/hooks/use-mobile";

export function CurrentYearPerformance() {
  const isMobile = useIsMobile();
  const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1NyVtFQCsC78nYMHEz5FwL9JUGjTso8Du7tTFTl6YHf4/edit?gid=1382966439";
  
  // For mobile devices, we'll use a link instead of an embed
  if (isMobile) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Current Year Trades</h2>
          <p className="text-muted-foreground">
            Performance data for the current trading year
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-md">
          <p className="text-center mb-4">
            For the best viewing experience, please open the spreadsheet directly:
          </p>
          <a 
            href={spreadsheetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            View Current Year Performance
          </a>
        </div>
      </div>
    );
  }

  // For desktop, we'll embed the spreadsheet
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Year Trades</h2>
        <p className="text-muted-foreground">
          Performance data for the current trading year
        </p>
      </div>
      
      <div className="w-full">
        <iframe 
          src={`${spreadsheetUrl}&widget=true&headers=false`}
          className="w-full border-none rounded-md"
          style={{ height: "600px" }}
          title="Current Year Performance"
        ></iframe>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>Note: This data represents trades completed in the current year. For a complete trading history, please refer to the Historical Performance tab.</p>
      </div>
    </div>
  );
}
