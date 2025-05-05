
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Separate main navigation links from account-related links
  const mainNavLinks = [
    { title: "Home", path: "/" },
    { title: "Trading Performance", path: "/stats" },
    { title: "Terms of Service", path: "/terms-of-service" },
    { title: "Privacy", path: "/privacy" },
  ];
  
  // Make account a separate, highlighted item
  const accountLink = { title: "My Account", path: "/account" };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary flex items-center">
              <div className="h-20 w-20 mr-4 overflow-hidden">
                <img 
                  src="/lovable-uploads/88b166b0-b5a4-48e9-b060-622318765743.png" 
                  alt="DECO GLOBAL Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <span>Algorithmic Trading</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {mainNavLinks.map((link) => (
              <Link 
                key={link.title} 
                to={link.path} 
                className={`text-muted-foreground hover:text-primary transition-colors ${
                  (location.pathname === link.path || 
                   (location.hash === link.path && link.path.startsWith('#'))) ? 
                   'text-primary font-medium' : ''
                }`}
              >
                {link.title}
              </Link>
            ))}
            
            {/* Make My Account button more prominent */}
            <Link to={accountLink.path}>
              <Button 
                variant={location.pathname === accountLink.path ? "default" : "outline"} 
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {accountLink.title}
              </Button>
            </Link>
            
            <Link to="/get-started">
              <Button variant={location.pathname === "/get-started" ? "secondary" : "default"}>
                Get Started
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            {isMobile ? (
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="px-4 pb-8 pt-4">
                  <div className="flex flex-col items-center space-y-4">
                    {mainNavLinks.map((link) => (
                      <Link 
                        key={link.title} 
                        to={link.path} 
                        className={`w-full text-center py-3 text-lg font-medium border-b border-border ${
                          (location.pathname === link.path || 
                           (location.hash === link.path && link.path.startsWith('#'))) ? 
                           'text-primary' : ''
                        }`}
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {link.title}
                      </Link>
                    ))}
                    
                    {/* Make mobile account link more noticeable */}
                    <Link 
                      to={accountLink.path} 
                      className={`w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border ${
                        location.pathname === accountLink.path ? 
                        'bg-primary/10 text-primary' : 'bg-muted/50'
                      }`}
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      {accountLink.title}
                    </Link>
                    
                    <Link 
                      to="/get-started" 
                      className="w-full mt-4" 
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button 
                        className="w-full"
                        variant={location.pathname === "/get-started" ? "secondary" : "default"}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
