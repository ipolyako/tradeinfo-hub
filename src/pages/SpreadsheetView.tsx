
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";

const SpreadsheetView = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center mb-8">
          <FileSpreadsheet className="h-6 w-6 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Transactions History</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Transactions History - 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              This is the current year transaction history for all algorithmic trading activities. 
              The spreadsheet below contains real-time data updated from our trading systems.
            </p>
            
            <div className="aspect-[16/9] w-full border border-border rounded-md overflow-hidden">
              <iframe 
                src="https://drive.google.com/file/d/1hXfQPf1ZjM6E8HjTW_DbUHpY8E4IBtg8/preview"
                className="w-full h-full"
                title="Transactions History Spreadsheet"
                loading="lazy"
                allow="autoplay"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpreadsheetView;
