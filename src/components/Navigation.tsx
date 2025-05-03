
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
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

  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Features", path: "#features" },
    { title: "Stats", path: "/stats" },
    { title: "Terms of Service", path: "/terms-of-service" },
    { title: "Privacy", path: "/privacy" },
    { title: "My Account", path: "/account" },
  ];

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">Algorithmic Trading</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.title} 
                to={link.path} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.title}
              </Link>
            ))}
            <Link to="/get-started">
              <Button>Get Started</Button>
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
                    {navLinks.map((link) => (
                      <Link 
                        key={link.title} 
                        to={link.path} 
                        className="w-full text-center py-3 text-lg font-medium border-b border-border"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {link.title}
                      </Link>
                    ))}
                    <Link 
                      to="/get-started" 
                      className="w-full mt-4" 
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button className="w-full">Get Started</Button>
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
