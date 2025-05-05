
import { ArrowDownUp, Clock, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StrategyDetails = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Our Trading Strategy</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
          
          <div className="space-y-4 text-muted-foreground">
            <h3 className="text-xl font-semibold text-foreground">Algorithmic Day Trading Strategy</h3>
            <p>
              Our proprietary trading algorithm specializes in opposite-directional ETF trading, 
              designed to capitalize on intraday market volatility while eliminating overnight exposure risk.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start space-x-3">
                <ArrowDownUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Paired ETF Trading</h4>
                  <p className="text-sm">
                    We trade correlated ETF pairs to capitalize on price movement patterns
                    that occur regardless of market direction.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Zero Overnight Positions</h4>
                  <p className="text-sm">
                    All positions are closed before market close, eliminating exposure to overnight
                    market risk and news events.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Risk Management</h4>
                  <p className="text-sm">
                    Disciplined position sizing, stop-loss protocols, and maximum drawdown limits
                    protect capital during volatile market conditions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Performance Optimization</h4>
                  <p className="text-sm">
                    Continuous algorithm refinement based on real-world performance metrics
                    and changing market conditions.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold pt-4 text-foreground">Key Advantages</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Reduced market risk through intraday-only trading</li>
              <li>Minimized exposure to overnight news events and gap openings</li>
              <li>Systematic approach eliminates emotional trading decisions</li>
              <li>Consistent execution through automated trading systems</li>
              <li>Diversified strategy that can perform in various market conditions</li>
            </ul>
          </div>
          
          <div className="pt-6 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
