import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, List, History, CreditCard, WalletCards, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useToast } from "@/hooks/use-toast";

// Define the type for navigation links
interface NavLink {
  title: string;
  path: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavigationProps {
  onAccountClick?: () => void;
}

export const Navigation = ({ onAccountClick }: NavigationProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();

  // Check authentication status for navigation
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handler for logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        // Close drawer after successful logout
        if (isMobile) {
          setTimeout(() => {
            setIsDrawerOpen(false);
          }, 300);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  // Handler for My Account button click when not logged in
  const handleAccountClick = () => {
    if (!session && onAccountClick) {
      onAccountClick();
    }
  };

  // Separate main navigation links from account-related links
  const mainNavLinks: NavLink[] = [
    { title: "Home", path: "/" },
    { title: "Trading Performance", path: "/stats" },
    { title: "Transactions History", path: "/transactions" },
    { title: "Terms of Service", path: "/terms-of-service" },
    { title: "Privacy", path: "/privacy" },
  ];
  
  // Account menu items
  const accountMenuItems: NavLink[] = [
    { title: "Profile", path: "/account", icon: User },
    { title: "Payments", path: "/payments", icon: WalletCards },
  ];

  // Enhanced mobile link handler with improved touch functionality
  const handleMobileLinkClick = (onClose: () => void) => {
    // Add a short delay to ensure the touch event completes fully
    setTimeout(() => {
      onClose();
    }, 50);
  };

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
              link.external ? (
                <a 
                  key={link.title} 
                  href={link.path} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.title}
                </a>
              ) : (
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
              )
            ))}
            
            {/* Account dropdown for authenticated users */}
            {session && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="cursor-pointer" role="button" tabIndex={0}>My Account</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-2 p-2 bg-background shadow-lg">
                        {accountMenuItems.map((item) => (
                          <li key={item.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={item.path}
                                className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent ${
                                  location.pathname === item.path ? 'bg-primary/10 text-primary' : ''
                                }`}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                        <li>
                          <NavigationMenuLink asChild>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent w-full text-left"
                            >
                              <LogOut className="h-4 w-4" />
                              Log Out
                            </button>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
            
            {/* If not authenticated, show "My Account" button with toast trigger */}
            {!session && (
              <Link to="/account" onClick={handleAccountClick}>
                <Button 
                  variant={location.pathname === "/account" ? "default" : "outline"} 
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  My Account
                </Button>
              </Link>
            )}
            
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
                  <Button variant="ghost" size="icon" className="touch-manipulation">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="px-4 pb-8 pt-4">
                  <div className="flex flex-col items-center space-y-4">
                    {mainNavLinks.map((link) => (
                      link.external ? (
                        <a 
                          key={link.title} 
                          href={link.path} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          {link.icon && <link.icon className="h-5 w-5" />}
                          {link.title}
                        </a>
                      ) : (
                        <Link 
                          key={link.title} 
                          to={link.path} 
                          className={`w-full text-center py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50 ${
                            (location.pathname === link.path || 
                             (location.hash === link.path && link.path.startsWith('#'))) ? 
                             'text-primary' : ''
                          }`}
                          onClick={() => handleMobileLinkClick(() => setIsDrawerOpen(false))}
                        >
                          {link.title}
                        </Link>
                      )
                    ))}
                    
                    {/* Mobile account section */}
                    {session && (
                      <>
                        <div className="w-full text-center py-2 text-lg font-medium mt-2">
                          My Account
                        </div>
                        {accountMenuItems.map((item) => (
                          <Link 
                            key={item.title}
                            to={item.path} 
                            className={`w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50 ${
                              location.pathname === item.path ? 
                              'bg-primary/10 text-primary' : 'bg-muted/50'
                            }`}
                            onClick={() => handleMobileLinkClick(() => setIsDrawerOpen(false))}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                          </Link>
                        ))}
                        <button 
                          onClick={() => {
                            handleLogout();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50 bg-muted/50"
                        >
                          <LogOut className="h-5 w-5" />
                          Log Out
                        </button>
                      </>
                    )}
                    
                    {/* If not authenticated, show My Account link with toast */}
                    {!session && (
                      <Link 
                        to="/account" 
                        className={`w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50 ${
                          location.pathname === "/account" ? 
                          'bg-primary/10 text-primary' : 'bg-muted/50'
                        }`}
                        onClick={() => {
                          handleAccountClick();
                          handleMobileLinkClick(() => setIsDrawerOpen(false));
                        }}
                      >
                        <User className="h-5 w-5" />
                        My Account
                      </Link>
                    )}
                    
                    <Link 
                      to="/get-started" 
                      className="w-full mt-4 touch-manipulation" 
                      onClick={() => handleMobileLinkClick(() => setIsDrawerOpen(false))}
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
