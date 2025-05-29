import { useState, useEffect, useRef } from "react";
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
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  const accountMenuRef = useRef<HTMLDivElement>(null);

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

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler for logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
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

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-[100] shadow-sm">
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
                    location.pathname === link.path ? 'text-primary font-medium' : ''
                  }`}
                >
                  {link.title}
                </Link>
              )
            ))}
            
            {/* Account menu for authenticated users */}
            {session && (
              <div className="relative" ref={accountMenuRef}>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                >
                  <User className="h-4 w-4" />
                  My Account
                </Button>
                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-[200px] bg-white rounded-md shadow-lg border py-1 z-[101]">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 hover:bg-accent ${
                          location.pathname === item.path ? 'bg-primary/10 text-primary' : ''
                        }`}
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsAccountOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-destructive hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* If not authenticated, show My Account button */}
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
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="touch-manipulation">
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4 pb-8 pt-4 fixed inset-x-0 bottom-0 z-[200]">
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
                          location.pathname === link.path ? 'text-primary' : ''
                        }`}
                        onClick={() => setIsDrawerOpen(false)}
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
                            location.pathname === item.path ? 'text-primary' : ''
                          }`}
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.title}
                        </Link>
                      ))}
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsDrawerOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50 text-destructive"
                      >
                        <LogOut className="h-5 w-5" />
                        Log Out
                      </button>
                    </>
                  )}
                  
                  {/* If not authenticated, show My Account link */}
                  {!session && (
                    <Link 
                      to="/account" 
                      className={`w-full flex items-center justify-center gap-2 py-3 text-lg font-medium border-b border-border touch-manipulation active:bg-accent/50 ${
                        location.pathname === "/account" ? 'text-primary' : ''
                      }`}
                      onClick={() => {
                        handleAccountClick();
                        setIsDrawerOpen(false);
                      }}
                    >
                      <User className="h-5 w-5" />
                      My Account
                    </Link>
                  )}
                  
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
          </div>
        </div>
      </div>
    </nav>
  );
};
