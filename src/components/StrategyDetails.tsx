
import { ArrowDownUp, Clock, Shield, TrendingUp } from "lucide-react";

export const StrategyDetails = () => {
  return (
    <section className="bg-muted py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Our Trading Strategy</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how our algorithmic trading system works to deliver consistent results
          </p>
        </div>
        
        <div className="bg-background rounded-lg shadow-lg p-6 space-y-6">
          <div className="space-y-4 text-muted-foreground">
            <h3 className="text-xl font-semibold text-foreground">Algorithmic Day Trading Strategy</h3>
            <p>
              Our strategy uses time-tested intensive backend validation strategies aimed to deliver 
              consistent results over various market conditions. We trade only the most popular high 
              liquidity ETFs such as TQQQ and SQQQ.
            </p>
            
            <p>
              Our sophisticated algorithms take advantage of directional price movements irrespective 
              of markets going up or down. The bot is tuned to deliver results in all market conditions.
            </p>

            <p>
              With our bot, you get statistical advantage over a long period of time. We aim at long-term 
              investment performance without the risks of nightly surprises when the market is closed. 
              You will never be caught in a position with markets gapping down.
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
              <li>Focus on high liquidity ETFs to ensure reliable execution</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
